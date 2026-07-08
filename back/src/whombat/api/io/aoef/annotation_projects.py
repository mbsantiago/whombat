import datetime
from pathlib import Path
from typing import BinaryIO

from soundevent.io.aoef import AnnotationProjectObject
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models
from whombat.api.common import utils
from whombat.api.io.aoef.annotation_tasks import get_annotation_tasks
from whombat.api.io.aoef.clip_annotations import get_clip_annotations
from whombat.api.io.aoef.clips import get_clips
from whombat.api.io.aoef.common import parse_aoef_object
from whombat.api.io.aoef.features import get_feature_names
from whombat.api.io.aoef.recordings import get_recordings
from whombat.api.io.aoef.sound_event_annotations import (
    get_sound_event_annotations,
)
from whombat.api.io.aoef.sound_events import get_sound_events
from whombat.api.io.aoef.tags import import_tags
from whombat.api.io.aoef.users import import_users
from whombat.schemas.users import SimpleUser


async def import_annotation_project(
    session: AsyncSession,
    src: Path | BinaryIO | str,
    audio_dir: Path,
    base_audio_dir: Path,
    imported_by: SimpleUser,
) -> models.AnnotationProject:
    obj = parse_aoef_object(src)

    if not isinstance(obj.data, AnnotationProjectObject):
        raise exceptions.DataFormatError(
            message=(
                "Invalid Annotation Project file. "
                "The provided file is a valid AOEF object, but it is not an "
                "Annotation Project. Detected object type: "
                f"'{obj.data.collection_type}'. "
                "Please ensure you provided the correct file or convert it "
                "to an Annotation Project."
            ),
            format="aoef-annotation-project",
        )

    imported_data = obj.data
    project = await get_or_create_annotation_project(session, imported_data)
    tags = await import_tags(session, imported_data.tags or [])
    users = await import_users(session, imported_data.users or [])
    feature_names = await get_feature_names(session, imported_data)
    recordings = await get_recordings(
        session,
        imported_data,
        tags=tags,
        users=users,
        feature_names=feature_names,
        audio_dir=audio_dir,
        base_audio_dir=base_audio_dir,
        should_import=False,
    )
    clips = await get_clips(
        session,
        imported_data,
        recordings=recordings,
        feature_names=feature_names,
    )
    sound_events = await get_sound_events(
        session,
        imported_data,
        recordings=recordings,
        feature_names=feature_names,
    )
    clip_annotations = await get_clip_annotations(
        session,
        imported_data,
        clips=clips,
        users=users,
        tags=tags,
        user=imported_by,
    )
    await get_sound_event_annotations(
        session,
        imported_data,
        sound_events=sound_events,
        clip_annotations=clip_annotations,
        users=users,
        tags=tags,
        user=imported_by,
    )
    await get_annotation_tasks(
        session,
        imported_data,
        clips=clips,
        annotation_projects={project.uuid: project.id},
        users=users,
        clip_annotations=clip_annotations,
    )
    await add_annotation_tags(
        session,
        imported_data,
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
        name=obj.name or "",
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
