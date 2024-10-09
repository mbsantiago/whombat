import datetime
import json
from pathlib import Path
from typing import BinaryIO

from soundevent.io import aoef
from soundevent.io.aoef import AnnotationProjectObject
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.common import utils
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
    src: Path | BinaryIO | str,
    audio_dir: Path,
    base_audio_dir: Path,
) -> models.AnnotationProject:
    if isinstance(src, (Path, str)):
        with open(src, "r") as file:
            data = json.load(file)
    else:
        data = json.loads(src.read())

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

    session.expire(project, ["tags"])

    return project


async def get_or_create_annotation_project(
    session: AsyncSession,
    obj: AnnotationProjectObject,
) -> models.AnnotationProject:
    stmt = select(models.AnnotationProject).where(
        models.AnnotationProject.uuid == obj.uuid
    )
    result = await session.execute(stmt)
    row = result.unique().one_or_none()
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
) -> list[models.AnnotationProjectTag]:
    """Add annotation tags to a project."""
    proj_tags = project.project_tags or []
    if not proj_tags:
        return []

    values = [
        {
            "annotation_project_id": project_id,
            "tag_id": tags[tag],
            "created_on": datetime.datetime.now(),
        }
        for tag in proj_tags
        if tag in tags
    ]

    if not values:
        return []

    return await utils.create_objects_without_duplicates(
        session,
        models.AnnotationProjectTag,
        values,
        key=lambda x: (x["annotation_project_id"], x["tag_id"]),
        key_column=(
            tuple_(
                models.AnnotationProjectTag.annotation_project_id,
                models.AnnotationProjectTag.tag_id,
            )
        ),
    )
