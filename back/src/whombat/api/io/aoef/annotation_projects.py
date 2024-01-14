import datetime
from pathlib import Path

from soundevent.io import aoef
from soundevent.io.aoef import AnnotationProjectObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.annotation_tasks import get_annotation_tasks
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


async def import_annotation_project(
    session: AsyncSession,
    data: dict,
    audio_dir: Path,
    base_audio_dir: Path,
) -> models.AnnotationProject:
    if not isinstance(data, dict):
        raise TypeError(f"Expected dict, got {type(data)}")

    if "data" not in data:
        raise ValueError("Missing 'data' key")

    obj = aoef.AnnotationProjectObject.model_validate(data["data"])

    project = await get_or_create_annotation_project(session, obj)

    tags = await import_tags(session, obj.tags or [])
    users = await import_users(session, obj.users or [])
    feature_names = await get_feature_names(session, obj)
    recordings = await get_recordings(
        session,
        obj,
        tags=tags,
        users=users,
        feature_names=feature_names,
        audio_dir=audio_dir,
        base_audio_dir=base_audio_dir,
        should_import=False,
    )
    clips = await get_clips(
        session,
        obj,
        recordings=recordings,
        feature_names=feature_names,
    )
    sound_events = await get_sound_events(
        session,
        obj,
        recordings=recordings,
        feature_names=feature_names,
    )
    clip_annotations = await get_clip_annotations(
        session,
        obj,
        clips=clips,
        users=users,
        tags=tags,
    )
    await get_sound_event_annotations(
        session,
        obj,
        sound_events=sound_events,
        clip_annotations=clip_annotations,
        users=users,
        tags=tags,
    )
    await get_annotation_tasks(
        session,
        obj,
        clips=clips,
        annotation_projects={project.uuid: project.id},
        users=users,
        clip_annotations=clip_annotations,
    )
    await add_annotation_tags(
        session,
        obj,
        project.id,
        tags,
    )
    return project


async def get_or_create_annotation_project(
    session: AsyncSession,
    obj: AnnotationProjectObject,
) -> models.AnnotationProject:
    stmt = select(models.AnnotationProject).where(
        models.AnnotationProject.uuid == obj.uuid
    )
    result = await session.execute(stmt)
    row = result.one_or_none()
    if row is not None:
        return row[0]

    db_obj = models.AnnotationProject(
        uuid=obj.uuid,
        name=obj.name,
        description=obj.description or "",
        annotation_instructions=obj.instructions,
        created_on=obj.created_on or datetime.datetime.now(),
    )
    session.add(db_obj)
    await session.flush()
    return db_obj


async def add_annotation_tags(
    session: AsyncSession,
    project: AnnotationProjectObject,
    project_id: int,
    tags: dict[int, int],
) -> None:
    """Add annotation tags to a project."""
    proj_tags = project.project_tags or []
    if not proj_tags:
        return

    values = []
    for tag in proj_tags:
        tag_bd_id = tags.get(tag)
        if tag_bd_id is None:
            continue
        values.append(
            {
                "annotation_project_id": project_id,
                "tag_id": tag_bd_id,
                "created_on": datetime.datetime.now(),
            }
        )

    stmt = select(
        models.AnnotationProjectTag.annotation_project_id,
        models.AnnotationProjectTag.tag_id,
    ).where(
        tuple_(
            models.AnnotationProjectTag.annotation_project_id,
            models.AnnotationProjectTag.tag_id,
        ).in_([(v["annotation_project_id"], v["tag_id"]) for v in values])
    )
    result = await session.execute(stmt)
    existing = set(result.all())

    missing = [
        v
        for v in values
        if (v["annotation_project_id"], v["tag_id"]) not in existing
    ]
    if not missing:
        return

    stmt = insert(models.AnnotationProjectTag).values(missing)
    await session.execute(stmt)
