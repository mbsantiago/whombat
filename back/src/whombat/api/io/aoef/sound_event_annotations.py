import datetime
from uuid import UUID, uuid4

from soundevent.io.aoef import AnnotationSetObject, EvaluationObject
from soundevent.io.aoef.clip_annotations import ClipAnnotationsObject
from soundevent.io.aoef.sound_event_annotation import (
    SoundEventAnnotationObject,
)
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.common import get_mapping
from whombat.api.io.aoef.notes import import_notes


async def get_sound_event_annotations(
    session: AsyncSession,
    obj: AnnotationSetObject | EvaluationObject,
    sound_events: dict[UUID, int],
    clip_annotations: dict[UUID, int],
    users: dict[UUID, UUID],
    tags: dict[int, int],
) -> dict[UUID, int]:
    sound_event_annotations = obj.sound_event_annotations or []
    clip_annotations_objs = obj.clip_annotations or []
    if sound_event_annotations:
        (
            sound_event_annotations,
            clip_annotation_uuids,
        ) = get_clip_annotations_uuids(
            sound_event_annotations,
            clip_annotations_objs,
        )

        return await import_sound_event_annotations(
            session,
            sound_event_annotations,
            clip_annotation_uuids,
            sound_events=sound_events,
            clip_annotations=clip_annotations,
            users=users,
            tags=tags,
        )

    uuids = set()
    for clip_annotation in clip_annotations_objs:
        if not clip_annotation.sound_events:
            continue

        for sound_event in clip_annotation.sound_events:
            uuids.add(sound_event)

    if isinstance(obj, EvaluationObject):
        for match in obj.matches or []:
            uuids.add(match.target)

    if not uuids:
        return {}

    return await get_mapping(session, uuids, models.SoundEventAnnotation)


async def import_sound_event_annotations(
    session: AsyncSession,
    sound_events_annotations: list[SoundEventAnnotationObject],
    clip_annotation_uuids: list[UUID],
    sound_events: dict[UUID, int],
    clip_annotations: dict[UUID, int],
    users: dict[UUID, UUID],
    tags: dict[int, int],
) -> dict[UUID, int]:
    if not sound_events_annotations:
        return {}

    if not len(sound_events_annotations) == len(clip_annotation_uuids):
        raise ValueError(
            "The number of sound event annotations and clip annotation UUIDs "
            "must be equal."
        )

    mapping = await _create_sound_event_annotations(
        session=session,
        sound_events_annotations=sound_events_annotations,
        clip_annotation_uuids=clip_annotation_uuids,
        sound_events=sound_events,
        clip_annotations=clip_annotations,
        users=users,
    )

    await _create_sound_event_notes(
        session,
        sound_events_annotations,
        mapping,
        users,
    )

    await _create_sound_event_annotation_tags(
        session,
        sound_events_annotations,
        mapping,
        tags,
    )

    return mapping


async def _create_sound_event_annotations(
    session: AsyncSession,
    sound_events_annotations: list[SoundEventAnnotationObject],
    clip_annotation_uuids: list[UUID],
    sound_events: dict[UUID, int],
    clip_annotations: dict[UUID, int],
    users: dict[UUID, UUID],
) -> dict[UUID, int]:
    # Get existing by UUID
    mapping = await get_mapping(
        session,
        {s.uuid for s in sound_events_annotations},
        models.SoundEventAnnotation,
    )

    missing = [
        (s, ca_uuid)
        for s, ca_uuid in zip(sound_events_annotations, clip_annotation_uuids)
        if s.uuid not in mapping
    ]
    if not missing:
        return mapping

    values = []
    uuids = set()
    for annotation, clip_annotation_uuid in missing:
        sound_event_db_id = sound_events.get(annotation.sound_event)
        if sound_event_db_id is None:
            # Skip annotations that do not have a sound event.
            continue

        clip_annotation_db_id = clip_annotations.get(clip_annotation_uuid)
        if clip_annotation_db_id is None:
            # Skip annotations that do not have a clip annotation.
            continue

        created_by_db_id = (
            None
            if annotation.created_by is None
            else users.get(annotation.created_by)
        )

        # NOTE: This addresses an edge case where a sound event annotation is
        # present in multiple clip annotations within the same annotation set.
        # This scenario may arise when creating clip annotations by segmenting
        # a longer recording. As a result, the sound event annotations might be
        # duplicated across clips, each with its unique UUID. To handle this,
        # we generate a new UUID for each duplicated annotation. While this
        # solution is not ideal, it serves as the best approach for the current
        # implementation.
        uuid = annotation.uuid
        if uuid in uuids:
            uuid = uuid4()

        uuids.add(uuid)
        values.append(
            {
                "uuid": uuid,
                "sound_event_id": sound_event_db_id,
                "clip_annotation_id": clip_annotation_db_id,
                "created_by_id": created_by_db_id,
                "created_on": annotation.created_on or datetime.datetime.now(),
            }
        )

    # If values is empty, then all possilbe annotations already exist in the
    # database.
    if not values:
        return mapping

    stmt = insert(models.SoundEventAnnotation)
    await session.execute(stmt, values)

    # Get the IDs of the newly created annotations.
    created = await get_mapping(
        session,
        {v["uuid"] for v in values},
        models.SoundEventAnnotation,
    )
    mapping.update(created)

    return mapping


async def _create_sound_event_notes(
    session: AsyncSession,
    sound_events_annotations: list[SoundEventAnnotationObject],
    mapping: dict[UUID, int],
    users: dict[UUID, UUID],
) -> None:
    notes = [
        note
        for annotation in sound_events_annotations
        for note in annotation.notes or []
    ]

    notes_mapping = await import_notes(session, notes, users)

    values = []
    for annotation in sound_events_annotations:
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
                    "created_on": note.created_on or datetime.datetime.now(),
                }
            )

    if not values:
        return

    stmt = insert(models.SoundEventAnnotationNote)
    await session.execute(stmt, values)


async def _create_sound_event_annotation_tags(
    session: AsyncSession,
    sound_events_annotations: list[SoundEventAnnotationObject],
    mapping: dict[UUID, int],
    tags: dict[int, int],
) -> None:
    values = []
    dedups = set()
    for annotation in sound_events_annotations:
        annotation_db_id = mapping.get(annotation.uuid)
        if annotation_db_id is None:
            continue

        if not annotation.tags:
            continue

        for tag in annotation.tags:
            tag_db_id = tags.get(tag)
            if tag_db_id is None:
                continue

            if (annotation_db_id, tag_db_id) in dedups:
                # Skip duplicate tags.
                continue

            dedups.add((annotation_db_id, tag_db_id))

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

    stmt = select(
        models.SoundEventAnnotationTag.sound_event_annotation_id,
        models.SoundEventAnnotationTag.tag_id,
    ).where(
        tuple_(
            models.SoundEventAnnotationTag.sound_event_annotation_id,
            models.SoundEventAnnotationTag.tag_id,
        ).in_([(v["sound_event_annotation_id"], v["tag_id"]) for v in values])
    )
    result = await session.execute(stmt)

    missing = [
        v
        for v in values
        if (v["sound_event_annotation_id"], v["tag_id"]) not in result.all()
    ]
    if not missing:
        return

    stmt = insert(models.SoundEventAnnotationTag)
    await session.execute(stmt, missing)


def get_clip_annotations_uuids(
    sound_event_annotations: list[SoundEventAnnotationObject],
    clip_annotations: list[ClipAnnotationsObject] | None,
) -> tuple[list[SoundEventAnnotationObject], list[UUID]]:
    if clip_annotations is None:
        raise ValueError("Missing 'clip_annotations' key in annotation set.")

    mapping = {se.uuid: se for se in sound_event_annotations}
    sound_event_annotations = []
    clip_annotation_uuids = []
    for clip_annotation in clip_annotations:
        if not clip_annotation.sound_events:
            continue

        for sound_event in clip_annotation.sound_events:
            sound_event_annotations.append(mapping[sound_event])
            clip_annotation_uuids.append(clip_annotation.uuid)

    return sound_event_annotations, clip_annotation_uuids
