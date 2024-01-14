import datetime
from pathlib import Path
from uuid import UUID

from soundevent.io.aoef import EvaluationSetObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.clip_annotations import get_clip_annotations
from whombat.api.io.aoef.clips import get_clips
from whombat.api.io.aoef.features import get_feature_names
from whombat.api.io.aoef.recordings import get_recordings
from whombat.api.io.aoef.sound_event_annotations import (
    get_sound_event_annotations,
)
from whombat.api.io.aoef.sound_events import get_sound_events
from whombat.api.io.aoef.tags import import_tags
from whombat.api.io.aoef.users import import_users


async def import_evaluation_set(
    session: AsyncSession,
    obj: dict,
    task: str,
    audio_dir: Path,
    base_audio_dir: Path,
) -> models.EvaluationSet:
    if not isinstance(obj, dict):
        raise TypeError(f"Expected dict, got {type(obj)}")

    if "data" not in obj:
        raise ValueError("Missing 'data' key")

    data = obj["data"]
    evalset_object = EvaluationSetObject.model_validate(data)

    project = await get_or_create_evaluation_set(
        session,
        evalset_object,
        task=task,
    )

    tags = await import_tags(session, evalset_object.tags or [])
    users = await import_users(session, evalset_object.users or [])
    feature_names = await get_feature_names(
        session,
        evalset_object,
    )
    recordings = await get_recordings(
        session,
        evalset_object,
        tags=tags,
        users=users,
        feature_names=feature_names,
        audio_dir=audio_dir,
        base_audio_dir=base_audio_dir,
        should_import=False,
    )
    clips = await get_clips(
        session,
        evalset_object,
        recordings=recordings,
        feature_names=feature_names,
    )
    sound_events = await get_sound_events(
        session,
        evalset_object,
        recordings=recordings,
        feature_names=feature_names,
    )
    clip_annotations = await get_clip_annotations(
        session,
        evalset_object,
        clips=clips,
        users=users,
        tags=tags,
    )
    await get_sound_event_annotations(
        session,
        evalset_object,
        sound_events=sound_events,
        clip_annotations=clip_annotations,
        users=users,
        tags=tags,
    )
    await add_clip_annotations(
        session,
        evalset_object,
        project.id,
        clip_annotations,
    )
    await add_evaluation_tags(
        session,
        evalset_object,
        project.id,
        tags,
    )
    return project


async def get_or_create_evaluation_set(
    session: AsyncSession,
    obj: EvaluationSetObject,
    task: str = "sound_event_detection",
) -> models.EvaluationSet:
    stmt = select(models.EvaluationSet).where(
        models.EvaluationSet.uuid == obj.uuid
    )
    result = await session.execute(stmt)
    row = result.one_or_none()
    if row is not None:
        return row[0]

    db_obj = models.EvaluationSet(
        uuid=obj.uuid,
        name=obj.name,
        task=task,
        description=obj.description or "",
        created_on=obj.created_on or datetime.datetime.now(),
    )
    session.add(db_obj)
    await session.flush()
    return db_obj


async def add_evaluation_tags(
    session: AsyncSession,
    obj: EvaluationSetObject,
    obj_id: int,
    tags: dict[int, int],
) -> None:
    """Add annotation tags to a project."""
    proj_tags = obj.evaluation_tags or []
    if not proj_tags:
        return

    values = []
    for tag in proj_tags:
        tag_bd_id = tags.get(tag)
        if tag_bd_id is None:
            continue
        values.append(
            {
                "evaluation_set_id": obj_id,
                "tag_id": tag_bd_id,
                "created_on": datetime.datetime.now(),
            }
        )

    stmt = select(
        models.EvaluationSetTag.evaluation_set_id,
        models.EvaluationSetTag.tag_id,
    ).where(
        tuple_(
            models.EvaluationSetTag.evaluation_set_id,
            models.EvaluationSetTag.tag_id,
        ).in_([(v["evaluation_set_id"], v["tag_id"]) for v in values])
    )
    result = await session.execute(stmt)
    existing = set(result.all())

    missing = [
        v
        for v in values
        if (v["evaluation_set_id"], v["tag_id"]) not in existing
    ]
    if not missing:
        return

    stmt = insert(models.EvaluationSetTag).values(missing)
    await session.execute(stmt)


async def add_clip_annotations(
    session: AsyncSession,
    obj: EvaluationSetObject,
    obj_id: int,
    clip_annotations: dict[UUID, int],
) -> None:
    """Add clip annotations to a project."""
    proj_clip_annotations = obj.clip_annotations or []
    if not proj_clip_annotations:
        return

    values = []
    for clip_annotation in proj_clip_annotations:
        clip_annotation_bd_id = clip_annotations.get(clip_annotation.uuid)
        if clip_annotation_bd_id is None:
            continue
        values.append(
            {
                "evaluation_set_id": obj_id,
                "clip_annotation_id": clip_annotation_bd_id,
                "created_on": datetime.datetime.now(),
            }
        )

    stmt = select(
        models.EvaluationSetAnnotation.evaluation_set_id,
        models.EvaluationSetAnnotation.clip_annotation_id,
    ).where(
        tuple_(
            models.EvaluationSetAnnotation.evaluation_set_id,
            models.EvaluationSetAnnotation.clip_annotation_id,
        ).in_(
            [(v["evaluation_set_id"], v["clip_annotation_id"]) for v in values]
        )
    )
    result = await session.execute(stmt)
    existing = set(result.all())

    missing = [
        v
        for v in values
        if (v["evaluation_set_id"], v["clip_annotation_id"]) not in existing
    ]
    if not missing:
        return

    stmt = insert(models.EvaluationSetAnnotation)
    await session.execute(stmt, missing)
