import datetime
from uuid import UUID

from soundevent.io.aoef import AnnotationSetObject, EvaluationObject
from soundevent.io.aoef.clip_annotations import ClipAnnotationsObject
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.common import get_mapping
from whombat.api.io.aoef.notes import import_notes


async def get_clip_annotations(
    session: AsyncSession,
    obj: AnnotationSetObject | EvaluationObject,
    clips: dict[UUID, int],
    users: dict[UUID, UUID],
    tags: dict[int, int],
) -> dict[UUID, int]:
    clip_annotations = obj.clip_annotations or []
    if clip_annotations:
        return await import_clip_annotations(
            session,
            clip_annotations,
            clips=clips,
            users=users,
            tags=tags,
        )

    if isinstance(obj, AnnotationSetObject):
        return {}

    clip_annotation_uuids = set()

    clip_evaluations = obj.clip_evaluations or []
    for evaluation in clip_evaluations:
        clip_annotation_uuids.add(evaluation.annotations)

    if not clip_annotation_uuids:
        return {}

    return await get_mapping(
        session,
        clip_annotation_uuids,
        models.ClipAnnotation,
    )


async def import_clip_annotations(
    session: AsyncSession,
    clip_annotations: list[ClipAnnotationsObject],
    clips: dict[UUID, int],
    users: dict[UUID, UUID],
    tags: dict[int, int],
) -> dict[UUID, int]:
    if not clip_annotations:
        return {}

    mapping = await _create_clip_annotations(
        session=session,
        clip_annotations=clip_annotations,
        clips=clips,
    )

    await _create_clip_annotation_notes(
        session,
        clip_annotations,
        mapping,
        users,
    )

    await _create_clip_annotation_tags(
        session,
        clip_annotations,
        mapping,
        tags,
    )

    return mapping


async def _create_clip_annotations(
    session: AsyncSession,
    clip_annotations: list[ClipAnnotationsObject],
    clips: dict[UUID, int],
) -> dict[UUID, int]:
    """Create clip annotations."""
    # Get existing by UUID
    stmt = select(models.ClipAnnotation.id, models.ClipAnnotation.uuid).where(
        models.ClipAnnotation.uuid.in_({a.uuid for a in clip_annotations})
    )
    result = await session.execute(stmt)
    mapping = {r[1]: r[0] for r in result.all()}

    missing = [s for s in clip_annotations if s.uuid not in mapping]
    if not missing:
        return mapping

    values = []
    for annotation in missing:
        clip_db_id = clips.get(annotation.clip)
        if clip_db_id is None:
            continue

        values.append(
            {
                "uuid": annotation.uuid,
                "clip_id": clip_db_id,
                "created_on": annotation.created_on or datetime.datetime.now(),
            }
        )

    # If values is empty, then all possilbe annotations already exist in the
    # database.
    if not values:
        return mapping

    stmt = insert(models.ClipAnnotation).values(values)
    result = await session.execute(stmt)

    # Get the IDs of the newly created annotations.
    stmt = select(models.ClipAnnotation.id, models.ClipAnnotation.uuid).where(
        models.ClipAnnotation.uuid.in_({v["uuid"] for v in values})
    )
    result = await session.execute(stmt)
    mapping.update({r[1]: r[0] for r in result.all()})

    return mapping


async def _create_clip_annotation_notes(
    session: AsyncSession,
    clip_annotations: list[ClipAnnotationsObject],
    mapping: dict[UUID, int],
    users: dict[UUID, UUID],
) -> None:
    """Create clip annotation notes."""

    notes = [
        note
        for annotation in clip_annotations
        for note in annotation.notes or []
    ]

    notes_mapping = await import_notes(session, notes, users)

    values = []
    for annotation in clip_annotations:
        annotation_db_id = mapping.get(annotation.uuid)
        if annotation_db_id is None:
            continue

        if not annotation.notes:
            continue

        for note in annotation.notes:
            note_db_id = notes_mapping.get(note.uuid)
            if note_db_id is None:
                continue

            values.append(
                {
                    "sound_event_annotation_id": annotation_db_id,
                    "note_id": note_db_id,
                }
            )

    if not values:
        return

    stmt = insert(models.SoundEventAnnotationNote).values(values)
    await session.execute(stmt)


async def _create_clip_annotation_tags(
    session: AsyncSession,
    clip_annotations: list[ClipAnnotationsObject],
    mapping: dict[UUID, int],
    tags: dict[int, int],
) -> None:
    """Create clip annotation tags."""
    values = []
    for annotation in clip_annotations:
        annotation_db_id = mapping.get(annotation.uuid)
        if annotation_db_id is None:
            continue

        if not annotation.tags:
            continue

        for tag in annotation.tags:
            tag_db_id = tags.get(tag)
            if tag_db_id is None:
                continue

            values.append(
                {
                    "sound_event_annotation_id": annotation_db_id,
                    "tag_id": tag_db_id,
                    "created_on": annotation.created_on
                    or datetime.datetime.now(),
                }
            )

    if not values:
        return

    stmt = insert(models.SoundEventAnnotationTag).values(values)
    await session.execute(stmt)
