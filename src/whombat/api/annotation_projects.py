"""Python API for annotation projects."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data as sd
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common, users
from whombat.filters.base import Filter

__all__ = [
    "add_tag",
    "create",
    "delete",
    "get_by_id",
    "get_by_name",
    "get_by_uuid",
    "get_many",
    "remove_tag",
    "update",
]


caches = cache.CacheCollection(schemas.AnnotationProject)


@caches.cached(
    name="annotation_project_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_project_id: annotation_project_id,
    data_key=lambda annotation_project: annotation_project.id,
)
async def get_by_id(
    session: AsyncSession, annotation_project_id: int
) -> schemas.AnnotationProject:
    """Get an annotation project by its ID."""
    annotation_project = await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.cached(
    name="annotation_project_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_project_uuid: annotation_project_uuid,
    data_key=lambda annotation_project: annotation_project.uuid,
)
async def get_by_uuid(
    session: AsyncSession, annotation_project_uuid: UUID
) -> schemas.AnnotationProject:
    """Get an annotation project by its UUID."""
    annotation_project = await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.uuid == annotation_project_uuid,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.cached(
    name="annotation_project_by_name",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_project_name: annotation_project_name,
    data_key=lambda annotation_project: annotation_project.name,
)
async def get_by_name(
    session: AsyncSession, annotation_project_name: str
) -> schemas.AnnotationProject:
    """Get an annotation project by its name."""
    annotation_project = await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.name == annotation_project_name,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.AnnotationProject], int]:
    """Get all annotation projects."""
    annotation_projects, count = await common.get_objects(
        session,
        models.AnnotationProject,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.AnnotationProject.model_validate(ap)
        for ap in annotation_projects
    ], count


@caches.with_update
async def create(
    session: AsyncSession, data: schemas.AnnotationProjectCreate
) -> schemas.AnnotationProject:
    """Create an annotation project."""
    annotation_project = await common.create_object(
        session,
        models.AnnotationProject,
        data,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_update
async def update(
    session: AsyncSession,
    annotation_project_id: int,
    data: schemas.AnnotationProjectUpdate,
) -> schemas.AnnotationProject:
    """Update an annotation project."""
    annotation_project = await common.update_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
        data,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_clear
async def delete(
    session: AsyncSession,
    annotation_project_id: int,
) -> schemas.AnnotationProject:
    """Delete an annotation project."""
    annotation_project = await common.delete_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_update
async def add_tag(
    session: AsyncSession,
    annotation_project_id: int,
    tag_id: int,
) -> schemas.AnnotationProject:
    """Add a tag to an annotation project."""
    annotation_project = await common.add_tag_to_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
        tag_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_update
async def remove_tag(
    session: AsyncSession,
    annotation_project_id: int,
    tag_id: int,
) -> schemas.AnnotationProject:
    """Remove a tag from an annotation project."""
    annotation_project = await common.remove_tag_from_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
        tag_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


async def import_project(
    session: AsyncSession,
    data: sd.AnnotationProject,
) -> schemas.AnnotationProject:
    """Import an annotation project."""
    # FIX: This is currently broken due to changes in soundevent
    # Get recordings
    recording_uuids = {task.clip.recording.uuid for task in data.tasks}

    stmt = select(models.Recording.id, models.Recording.uuid).filter(
        models.Recording.uuid.in_(recording_uuids)
    )
    recordings = await session.execute(stmt)
    recording_mapping = {rec.uuid: rec.id for rec in recordings.all()}

    if len(recording_mapping) != len(recording_uuids):
        raise ValueError("Some recordings do not exist.")

    # Create clips
    clips_info = [
        schemas.ClipCreate(
            uuid=task.clip.uuid,
            recording_id=recording_mapping[task.clip.recording.uuid],
            start_time=task.clip.start_time,
            end_time=task.clip.end_time,
        )
        for task in data.tasks
    ]
    assert all(task.clip.uuid is not None for task in data.tasks)

    db_clips = await common.create_objects_without_duplicates(
        session,
        models.Clip,
        clips_info,
        key=lambda clip: clip.uuid,
        key_column=models.Clip.uuid,
        return_all=True,
    )
    await session.flush()
    clip_mapping = {clip.uuid: clip.id for clip in db_clips}

    # Create tags
    clip_level_tags = [
        schemas.TagCreate(
            key=tag.key,
            value=tag.value,
        )
        for task in data.tasks
        for tag in task.tags
    ]
    sound_event_level_tags = [
        schemas.TagCreate(
            key=tag.key,
            value=tag.value,
        )
        for task in data.tasks
        for annotation in task.annotations
        for tag in annotation.tags
    ]
    tag_info = clip_level_tags + sound_event_level_tags
    tag_mapping = {}

    if tag_info:
        db_tags = await common.create_objects_without_duplicates(
            session,
            models.Tag,
            tag_info,
            key=lambda tag: (tag.key, tag.value),
            key_column=tuple_(
                models.Tag.key,
                models.Tag.value,
            ),
            return_all=True,
        )

        await session.flush()
        tag_mapping = {(tag.key, tag.value): tag.id for tag in db_tags}

    # Create sound events
    sound_event_info = [
        schemas.SoundEventCreate(
            uuid=annotation.sound_event.uuid,
            geometry=annotation.sound_event.geometry,
            recording_id=recording_mapping[
                annotation.sound_event.recording.id
            ],
        )
        for task in data.tasks
        for annotation in task.annotations
        if annotation.sound_event.geometry is not None
    ]

    db_sound_events = await common.create_objects_without_duplicates(
        session,
        models.SoundEvent,
        sound_event_info,
        key=lambda sound_event: sound_event.uuid,
        key_column=models.SoundEvent.uuid,
        return_all=True,
    )
    await session.flush()

    sound_event_mapping = {se.uuid: se.id for se in db_sound_events}

    # Create sound event features
    feature_names_info = [
        schemas.FeatureNameCreate(
            name=feature.name,
        )
        for task in data.tasks
        for annotation in task.annotations
        for feature in annotation.sound_event.features
    ]

    if feature_names_info:
        db_feature_names = await common.create_objects_without_duplicates(
            session,
            models.FeatureName,
            feature_names_info,
            key=lambda feature_name: feature_name.name,
            key_column=models.FeatureName.name,
            return_all=True,
        )
        await session.flush()

        feature_name_mapping = {
            feature_name.name: feature_name.id
            for feature_name in db_feature_names
        }

        feature_info = [
            schemas.SoundEventFeatureCreate(
                sound_event_id=sound_event_mapping[
                    annotation.sound_event.uuid
                ],
                feature_name_id=feature_name_mapping[feature.name],
                value=feature.value,
            )
            for task in data.tasks
            for annotation in task.annotations
            for feature in annotation.sound_event.features
        ]

        await common.create_objects_without_duplicates(
            session,
            models.SoundEventFeature,
            feature_info,
            key=lambda feature: (
                feature.sound_event_id,
                feature.feature_name_id,
            ),
            key_column=tuple_(
                models.SoundEventFeature.sound_event_id,
                models.SoundEventFeature.feature_name_id,
            ),
        )
        await session.flush()

    # Create project
    project = schemas.AnnotationProjectCreate(
        uuid=data.id,
        name=data.name,
        description=data.description or "",
        annotation_instructions=data.instructions,
    )

    all_projects = await common.create_objects_without_duplicates(
        session,
        models.AnnotationProject,
        [project],
        key=lambda project: project.uuid,
        key_column=models.AnnotationProject.uuid,
        return_all=True,
    )
    await session.flush()

    if len(all_projects) != 1:
        raise ValueError("Unexpected number of projects created.")

    db_project = all_projects[0]

    # Add tags to project
    if tag_mapping:
        project_tag_info = [
            schemas.AnnotationProjectTagCreate(
                annotation_project_id=db_project.id,
                tag_id=tag_id,
            )
            for tag_id in tag_mapping.values()
        ]

        await common.create_objects_without_duplicates(
            session,
            models.AnnotationProjectTag,
            project_tag_info,
            key=lambda project_tag: (
                project_tag.annotation_project_id,
                project_tag.tag_id,
            ),
            key_column=tuple_(
                models.AnnotationProjectTag.annotation_project_id,
                models.AnnotationProjectTag.tag_id,
            ),
        )
        await session.flush()

    # Create tasks
    task_info = [
        schemas.TaskCreate(
            uuid=task.id,
            project_id=db_project.id,
            clip_id=clip_mapping[task.clip.uuid],
        )
        for task in data.tasks
    ]
    db_tasks = await common.create_objects_without_duplicates(
        session,
        models.Task,
        task_info,
        key=lambda task: task.uuid,
        key_column=models.Task.uuid,
        return_all=True,
    )
    await session.flush()

    tasks_mapping = {task.uuid: task.id for task in db_tasks}

    # Create tasks tags
    anon = await users.get_anonymous_user(session)
    task_tag_info = [
        schemas.TaskTagCreate(
            task_id=tasks_mapping[task.id],
            tag_id=tag_mapping[(tag.key, tag.value)],
            created_by_id=anon.id,
        )
        for task in data.tasks
        for tag in task.tags
    ]

    await common.create_objects_without_duplicates(
        session,
        models.TaskTag,
        task_tag_info,
        key=lambda task_tag: (
            task_tag.task_id,
            task_tag.tag_id,
        ),
        key_column=tuple_(models.TaskTag.tag_id, models.TaskTag.task_id),
    )
    await session.flush()

    # Create task badges
    task_badge_info = [
        schemas.TaskStatusBadgeCreate(
            task_id=tasks_mapping[task.id],
            state=models.TaskState[badge.state.value],
            user_id=anon.id,
        )
        for task in data.tasks
        for badge in task.status_badges
    ]

    await common.create_objects_without_duplicates(
        session,
        models.TaskStatusBadge,
        task_badge_info,
        key=lambda task_badge: (
            task_badge.task_id,
            task_badge.state,
            task_badge.user_id,
        ),
        key_column=tuple_(
            models.TaskStatusBadge.task_id,
            models.TaskStatusBadge.state,
            models.TaskStatusBadge.user_id,
        ),
    )
    await session.flush()

    # Create annotations
    annotation_info = [
        schemas.AnnotationPostCreate(
            uuid=annotation.id,
            task_id=tasks_mapping[task.id],
            sound_event_id=sound_event_mapping[annotation.sound_event.uuid],
            created_by_id=anon.id,
        )
        for task in data.tasks
        for annotation in task.annotations
        if annotation.sound_event.geometry is not None
    ]
    db_annotations = await common.create_objects_without_duplicates(
        session,
        models.Annotation,
        annotation_info,
        key=lambda annotation: annotation.uuid,
        key_column=models.Annotation.uuid,
        return_all=True,
    )
    await session.flush()
    annotations_mapping = {
        annotation.uuid: annotation.id for annotation in db_annotations
    }

    # Create annotations tags
    annotation_tag_info = [
        schemas.AnnotationTagCreate(
            annotation_id=annotations_mapping[annotation.id],
            tag_id=tag_mapping[(tag.key, tag.value)],
            created_by_id=anon.id,
        )
        for task in data.tasks
        for annotation in task.annotations
        for tag in annotation.tags
    ]

    await common.create_objects_without_duplicates(
        session,
        models.AnnotationTag,
        annotation_tag_info,
        key=lambda annotation_tag: (
            annotation_tag.annotation_id,
            annotation_tag.tag_id,
        ),
        key_column=tuple_(
            models.AnnotationTag.annotation_id,
            models.AnnotationTag.tag_id,
        ),
    )
    await session.flush()

    await session.refresh(db_project)
    return schemas.AnnotationProject.model_validate(db_project)
