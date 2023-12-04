"""Python API for interacting with Tasks."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data
from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import clips, common, users
from whombat.filters.base import Filter

__all__ = [
    "get_by_id",
    "get_by_uuid",
    "get_many",
    "create",
    "create_many",
    "add_status_badge",
    "remove_status_badge",
    "delete",
    "from_soundevent",
    "to_soundevent",
]


task_caches = cache.CacheCollection(schemas.AnnotationTask)


@task_caches.cached(
    name="task_by_id",
    cache=LRUCache(maxsize=100),
    key=lambda _, task_id: task_id,
    data_key=lambda task: task.id,
)
async def get_by_id(
    session: AsyncSession,
    task_id: int,
) -> schemas.AnnotationTask:
    """Get a task by its ID.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    task_id
        ID of the task.

    Returns
    -------
    schemas.AnnotationTask
        Task with the given ID.

    Raises
    ------
    exceptions.NotFoundError
        If no task with the given ID exists.
    """
    task = await common.get_object(
        session,
        models.AnnotationTask,
        models.AnnotationTask.id == task_id,
    )
    return schemas.AnnotationTask.model_validate(task)


@task_caches.cached(
    name="task_by_uuid",
    cache=LRUCache(maxsize=100),
    key=lambda _, task_uuid: task_uuid,
    data_key=lambda task: task.uuid,
)
async def get_by_uuid(
    session: AsyncSession,
    task_uuid: UUID,
) -> schemas.AnnotationTask:
    """Get a task by its UUID.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    task_uuid
        UUID of the task.

    Returns
    -------
    schemas.AnnotationTask
        Task with the given UUID.

    Raises
    ------
    exceptions.NotFoundError
        If no task with the given UUID exists.
    """
    task = await common.get_object(
        session, models.AnnotationTask, models.AnnotationTask.uuid == task_uuid
    )
    return schemas.AnnotationTask.model_validate(task)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.AnnotationTask], int]:
    """Get a list of tasks.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    limit
        Maximum number of tasks to return, by default 100
    offset
        Number of tasks to skip, by default 0
    filters
        Filters to apply to the query, by default None
    sort_by
        Field to sort by, by default "-created_on"

    Returns
    -------
    annotation_tasks : schemas.AnnotationTaskList
        List of tasks matching the given criteria.
    count : int
        Total number of tasks matching the given criteria.
    """
    tasks, count = await common.get_objects(
        session,
        models.AnnotationTask,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.AnnotationTask.model_validate(task) for task in tasks
    ], count


async def create(
    session: AsyncSession,
    data: schemas.AnnotationTaskCreate,
) -> schemas.AnnotationTask:
    """Create a new task.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    data
        Task to create.

    Returns
    -------
    schemas.AnnotationTask
        Created task.

    Raises
    ------
    exceptions.DuplicateObjectError
        If a task with the given clip and project already exists.
    """
    # Make sure the clip and project exist
    await common.get_object(
        session,
        models.Clip,
        models.Clip.id == data.clip_id,
    )
    await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == data.annotation_project_id,
    )
    task = await common.create_object(session, models.AnnotationTask, data)
    await session.refresh(task)
    return schemas.AnnotationTask.model_validate(task)


async def create_many(
    session: AsyncSession,
    data: list[schemas.AnnotationTaskCreate],
) -> list[schemas.AnnotationTask]:
    """Create a list of new tasks.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    data
        Tasks to create.

    Returns
    -------
    list[schemas.AnnotationTask]
        Created tasks.
    """
    tasks = await common.create_objects_without_duplicates(
        session,
        model=models.AnnotationTask,
        data=data,
        key=lambda task: (task.clip_id, task.annotation_project_id),
        key_column=tuple_(
            models.AnnotationTask.clip_id,
            models.AnnotationTask.annotation_project_id,
        ),
    )
    return [schemas.AnnotationTask.model_validate(task) for task in tasks]


async def add_status_badge(
    session: AsyncSession,
    annotation_task_id: int,
    state: data.AnnotationState,
    user_id: UUID | None = None,
) -> schemas.AnnotationTask:
    """Add a status badge to a task.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_task_id
        ID of the task.
    user_id
        ID of the user to whom the status badge refers.
    state
        State of the task assigned by the user.

    Returns
    -------
    schemas.AnnotationTask
        Task with the new status badge.
    """
    # Make sure the task and user exist
    task = await common.get_object(
        session,
        models.AnnotationTask,
        models.AnnotationTask.id == annotation_task_id,
    )
    await common.get_object(session, models.User, models.User.id == user_id)
    await common.create_object(
        session,
        models.AnnotationStatusBadge,
        schemas.AnnotationTaskStatusBadgeCreate(
            task_id=annotation_task_id,
            user_id=user_id,
            state=state,
        ),
    )
    await session.refresh(task)
    return schemas.AnnotationTask.model_validate(task)


@task_caches.with_update
async def remove_status_badge(
    session: AsyncSession,
    annotation_task_id: int,
    status_badge_id: int,
) -> schemas.AnnotationTask:
    """Remove a status badge from a task.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_task_id
        ID of the task.
    status_badge_id
        ID of the status badge.

    Returns
    -------
    schemas.AnnotationTask
        Task with the status badge removed.
    """
    # Make sure the task exists
    obj = await common.get_object(
        session,
        models.AnnotationTask,
        models.AnnotationTask.id == annotation_task_id,
    )
    await common.delete_object(
        session,
        models.AnnotationStatusBadge,
        models.AnnotationStatusBadge.id == status_badge_id,
    )
    await session.refresh(obj)
    return schemas.AnnotationTask.model_validate(obj)


@task_caches.with_clear
async def delete(
    session: AsyncSession,
    annotation_task_id: int,
) -> schemas.AnnotationTask:
    """Delete a task.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_task_id
        ID of the task.

    Returns
    -------
    schemas.AnnotationTask
        Deleted task.
    """
    task = await common.delete_object(
        session,
        models.AnnotationTask,
        models.AnnotationTask.id == annotation_task_id,
    )
    return schemas.AnnotationTask.model_validate(task)


async def from_soundevent(
    session: AsyncSession,
    data: data.AnnotationTask,
    annotation_project_id: int,
) -> schemas.AnnotationTask:
    """Get or create a task from a `soundevent` task.

    Parameters
    ----------
    session
        An async database session.
    data
        The `soundevent` task.
    annotation_project_id
        The ID of the annotation project to which the task belongs.

    Returns
    -------
    schemas.AnnotationTask
        The created task.
    """
    try:
        annotation_task = await get_by_uuid(session, data.uuid)
    except exceptions.NotFoundError:
        clip = await clips.from_soundevent(session, data.clip)
        annotation_task = await create(
            session,
            schemas.AnnotationTaskCreate(
                clip_id=clip.id,
                annotation_project_id=annotation_project_id,
                uuid=data.uuid,
                created_on=data.created_on,
            ),
        )

    current_status_badges = {
        (b.user_id, b.state) for b in annotation_task.status_badges
    }
    for status_badge in data.status_badges:
        if (
            status_badge.owner.uuid if status_badge.owner else None,
            status_badge.state,
        ) in current_status_badges:
            continue

        annotation_task = await add_status_badge(
            session,
            annotation_task.id,
            status_badge.state,
            user_id=status_badge.owner.uuid if status_badge.owner else None,
        )

    return annotation_task


def to_soundevent(task: schemas.AnnotationTask) -> data.AnnotationTask:
    """Convert a task to a `soundevent` task.

    Parameters
    ----------
    task
        The task to convert.

    Returns
    -------
    data.AnnotationTask
        The converted task.
    """
    return data.AnnotationTask(
        uuid=task.uuid,
        clip=clips.to_soundevent(task.clip),
        status_badges=[
            data.StatusBadge(
                owner=users.to_soundevent(sb.user) if sb.user else None,
                state=sb.state,
                created_on=sb.created_on,
            )
            for sb in task.status_badges
        ],
        created_on=task.created_on,
    )
