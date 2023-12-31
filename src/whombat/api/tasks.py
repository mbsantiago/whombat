"""Python API for interacting with Tasks."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common, notes
from whombat.filters.base import Filter

__all__ = [
    "get_by_id",
    "get_by_uuid",
    "get_many",
    "create",
    "create_many",
    "add_tag",
    "add_status_badge",
    "add_note",
    "remove_note",
    "remove_tag",
    "remove_status_badge",
    "delete",
]


task_caches = cache.CacheCollection(schemas.Task)


@task_caches.cached(
    name="task_by_id",
    cache=LRUCache(maxsize=100),
    key=lambda _, task_id: task_id,
    data_key=lambda task: task.id,
)
async def get_by_id(
    session: AsyncSession,
    task_id: int,
) -> schemas.Task:
    """Get a task by its ID.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    Returns
    -------
    schemas.Task
        Task with the given ID.

    Raises
    ------
    exceptions.NotFoundError
        If no task with the given ID exists.
    """
    task = await common.get_object(
        session, models.Task, models.Task.id == task_id
    )
    return schemas.Task.model_validate(task)


@task_caches.cached(
    name="task_by_uuid",
    cache=LRUCache(maxsize=100),
    key=lambda _, task_uuid: task_uuid,
    data_key=lambda task: task.uuid,
)
async def get_by_uuid(
    session: AsyncSession,
    task_uuid: UUID,
) -> schemas.Task:
    """Get a task by its UUID.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_uuid : UUID
        UUID of the task.

    Returns
    -------
    schemas.Task
        Task with the given UUID.

    Raises
    ------
    exceptions.NotFoundError
        If no task with the given UUID exists.
    """
    task = await common.get_object(
        session, models.Task, models.Task.uuid == task_uuid
    )
    return schemas.Task.model_validate(task)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.Task], int]:
    """Get a list of tasks.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    limit : int, optional
        Maximum number of tasks to return, by default 100

    offset : int, optional
        Number of tasks to skip, by default 0

    filters : Sequence[Filter], optional
        Filters to apply to the query, by default None

    sort_by : str, optional
        Field to sort by, by default "-created_at"

    Returns
    -------
    schemas.TaskList
        List of tasks matching the given criteria.

    count : int
        Total number of tasks matching the given criteria.
    """
    tasks, count = await common.get_objects(
        session,
        models.Task,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [schemas.Task.model_validate(task) for task in tasks], count


async def create(
    session: AsyncSession,
    data: schemas.TaskCreate,
) -> schemas.Task:
    """Create a new task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    data : schemas.TaskCreate
        Task to create.

    Returns
    -------
    schemas.Task
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
        models.AnnotationProject.id == data.project_id,
    )
    task = await common.create_object(session, models.Task, data)
    await session.refresh(task)
    return schemas.Task.model_validate(task)


async def create_many(
    session: AsyncSession,
    data: list[schemas.TaskCreate],
) -> list[schemas.Task]:
    """Create a list of new tasks.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    data : list[schemas.TaskCreate]
        Tasks to create.

    Returns
    -------
    list[schemas.Task]
        Created tasks.

    """
    tasks = await common.create_objects_without_duplicates(
        session,
        model=models.Task,
        data=data,
        key=lambda task: (task.clip_id, task.project_id),
        key_column=tuple_(models.Task.clip_id, models.Task.project_id),
    )
    return [schemas.Task.model_validate(task) for task in tasks]


@task_caches.with_update
async def add_tag(
    session: AsyncSession,
    task_id: int,
    tag_id: int,
    created_by_id: UUID,
) -> schemas.Task:
    """Add a tag to a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    tag_id : int
        ID of the tag.

    created_by_id : UUID
        ID of the user who added the tag to the task.

    Returns
    -------
    schemas.TaskTag
        Created task tag.

    Raises
    ------
    exceptions.DuplicateObjectError
        If the task already has the given tag.
    """
    # Make sure the task, tag, and user exist
    task = await common.get_object(
        session, models.Task, models.Task.id == task_id
    )
    await common.get_object(session, models.Tag, models.Tag.id == tag_id)
    await common.get_object(
        session, models.User, models.User.id == created_by_id
    )

    for task_tag in task.tags:
        # Don't allow duplicate tags
        if (
            task_tag.tag_id == tag_id
            and task_tag.created_by_id == created_by_id
        ):
            return schemas.Task.model_validate(task)

    task_tag = await common.create_object(
        session,
        models.TaskTag,
        schemas.TaskTagCreate(
            task_id=task_id,
            tag_id=tag_id,
            created_by_id=created_by_id,
        ),
    )

    # Add tag to project if it is not already there
    await _add_tag_to_project(session, task_id, tag_id)

    await session.refresh(task)
    return schemas.Task.model_validate(task)


@task_caches.with_update
async def add_note(
    session: AsyncSession,
    task_id: int,
    note_id: int,
) -> schemas.Task:
    """Add a note to a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    note_id : int
        ID of the note.

    Returns
    -------
    schemas.TaskNote
        Created task note.

    Raises
    ------
    exceptions.DuplicateObjectError
        If the task already has the given note.
    """
    task = await common.add_note_to_object(
        session,
        models.Task,
        models.Task.id == task_id,
        note_id,
    )
    return schemas.Task.model_validate(task)


async def add_status_badge(
    session: AsyncSession,
    task_id: int,
    user_id: UUID,
    state: models.TaskState,
) -> schemas.Task:
    """Add a status badge to a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    user_id : UUID
        ID of the user to whom the status badge refers.

    state : models.TaskState
        State of the task assigned by the user.

    Returns
    -------
    schemas.Task
        Task with the new status badge.
    """
    # Make sure the task and user exist
    task = await common.get_object(
        session, models.Task, models.Task.id == task_id
    )
    await common.get_object(session, models.User, models.User.id == user_id)
    await common.create_object(
        session,
        models.TaskStatusBadge,
        schemas.TaskStatusBadgeCreate(
            task_id=task_id,
            user_id=user_id,
            state=state,
        ),
    )
    await session.refresh(task)
    return schemas.Task.model_validate(task)


@task_caches.with_update
async def update_note(
    session: AsyncSession,
    task_id: int,
    note_id: int,
    data: schemas.NoteUpdate,
) -> schemas.Task:
    """Update a note on a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    note_id : int
        ID of the note.

    data : schemas.NoteUpdate
        Data to update the note with.

    Returns
    -------
    schemas.Task
        Task with the updated note.

    Raises
    ------
    exceptions.NotFoundError
        If the task does not have the given note.
    """
    task = await get_by_id(session, task_id)
    updated_note = await notes.update(session, note_id, data)
    task.notes = [
        note if note.id != note_id else updated_note for note in task.notes
    ]
    return schemas.Task.model_validate(task)


@task_caches.with_update
async def remove_tag(
    session: AsyncSession,
    task_id: int,
    task_tag_id: int,
) -> schemas.Task:
    """Remove a tag from a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    task_tag_id : int
        ID of the task tag.

    Returns
    -------
    schemas.Task
        Task with the tag removed.
    """
    task = await common.get_object(
        session,
        models.Task,
        models.Task.id == task_id,
    )

    task_tag = next((tag for tag in task.tags if tag.id == task_tag_id), None)

    if task_tag is None:
        return schemas.Task.model_validate(task)

    task.tags.remove(task_tag)
    await session.flush()
    await session.refresh(task)
    return schemas.Task.model_validate(task)


@task_caches.with_update
async def remove_note(
    session: AsyncSession,
    task_id: int,
    note_id: int,
) -> schemas.Task:
    """Remove a note from a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    note_id : int
        ID of the note.

    Returns
    -------
    schemas.Task
        Task with the note removed.
    """
    task = await common.remove_note_from_object(
        session,
        models.Task,
        models.Task.id == task_id,
        note_id,
    )
    return schemas.Task.model_validate(task)


@task_caches.with_update
async def remove_status_badge(
    session: AsyncSession,
    task_id: int,
    status_badge_id: int,
) -> schemas.Task:
    """Remove a status badge from a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    status_badge_id : int
        ID of the status badge.

    Returns
    -------
    schemas.Task
        Task with the status badge removed.
    """
    # Make sure the task exists
    obj = await common.get_object(
        session,
        models.Task,
        models.Task.id == task_id,
    )
    await common.delete_object(
        session,
        models.TaskStatusBadge,
        models.TaskStatusBadge.id == status_badge_id,
    )
    await session.refresh(obj)
    return schemas.Task.model_validate(obj)


@task_caches.with_clear
async def delete(
    session: AsyncSession,
    task_id: int,
) -> schemas.Task:
    """Delete a task.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    task_id : int
        ID of the task.

    Returns
    -------
    schemas.Task
        Deleted task.
    """
    task = await common.delete_object(
        session,
        models.Task,
        models.Task.id == task_id,
    )
    return schemas.Task.model_validate(task)


async def get_notes(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.TaskNote], int]:
    """Get a page of taks notes.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    limit : int, optional
        Maximum number of notes to return, by default 100

    offset : int, optional
        Number of notes to skip, by default 0

    filters : Sequence[Filter], optional
        Filters to apply to the query, by default None

    sort_by : str, optional
        Field to sort by, by default "-created_at"

    Returns
    -------
    schemas.TaskNoteList
        List of task notes.

    count : int
        Total number of notes that match the filters.
    """
    notes, count = await common.get_objects(
        session,
        models.TaskNote,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return (
        [schemas.TaskNote.model_validate(note) for note in notes],
        count,
    )


async def get_tags(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.TaskTag], int]:
    """Get a page of task tags.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    limit : int, optional
        Maximum number of tags to return, by default 100

    offset : int, optional
        Number of tags to skip, by default 0

    filters : Sequence[Filter], optional
        Filters to apply to the query, by default None

    sort_by : str, optional
        Field to sort by, by default "-created_at"

    Returns
    -------
    schemas.TaskTagList
        List of task tags.

    count : int
        Total number of tags that match the filters.
    """
    tags, count = await common.get_objects(
        session,
        models.TaskTag,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return (
        [schemas.TaskTag.model_validate(tag) for tag in tags],
        count,
    )


async def _add_tag_to_project(
    session: AsyncSession,
    task_id: int,
    tag_id: int,
):
    stmt = (
        select(models.AnnotationProject)
        .join(
            models.Task, models.Task.project_id == models.AnnotationProject.id
        )
        .where(models.Task.id == task_id)
    )
    obj = await session.execute(stmt)
    annotation_project = obj.scalars().unique().first()

    if annotation_project is None:
        return

    for tag in annotation_project.tags:
        if tag.id == tag_id:
            return

    project_tag = models.AnnotationProjectTag(
        annotation_project_id=annotation_project.id,
        tag_id=tag_id,
    )
    session.add(project_tag)
    await session.flush()
