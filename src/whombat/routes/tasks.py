"""REST API routes for annotation tasks."""
from fastapi import APIRouter, Depends, Body
from typing import Annotated

from whombat import api, schemas
from whombat.dependencies import ActiveUser, Session
from whombat.filters.task_notes import TaskNoteFilter
from whombat.filters.tasks import TaskFilter
from whombat.filters.task_tags import TaskTagFilter
from whombat.routes.types import Limit, Offset
from whombat.models.task import TaskState

__all__ = [
    "tasks_router",
]


tasks_router = APIRouter()


@tasks_router.post(
    "/",
    response_model=list[schemas.Task],
)
async def create_tasks(
    session: Session,
    data: list[schemas.TaskCreate],
):
    """Create multiple annotation tasks."""
    tasks = await api.tasks.create_many(
        session,
        data,
    )
    await session.commit()
    return tasks


@tasks_router.get(
    "/",
    response_model=schemas.Page[schemas.Task],
)
async def get_tasks(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: TaskFilter = Depends(TaskFilter),  # type: ignore
    sort_by: str = "-created_at",
):
    """Get a page of annotation tasks."""
    tasks, total = await api.tasks.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tasks,
        total=total,
        limit=limit,
        offset=offset,
    )


@tasks_router.delete(
    "/detail/",
    response_model=schemas.Task,
)
async def delete_task(
    session: Session,
    task_id: int,
):
    """Remove a clip from an annotation project."""
    task = await api.tasks.delete(session, task_id)
    await session.commit()
    return task


@tasks_router.post(
    "/detail/notes/",
    response_model=schemas.Task,
)
async def create_task_note(
    session: Session,
    task_id: int,
    data: schemas.NoteCreate,
    user: ActiveUser,
):
    """Create a note for an annotation task."""
    note = await api.notes.create(
        session,
        schemas.NotePostCreate(
            created_by_id=user.id,
            **data.model_dump(),
        ),
    )
    task = await api.tasks.add_note(
        session,
        task_id,
        note.id,
    )
    await session.commit()
    return task


@tasks_router.delete(
    "/detail/notes/",
    response_model=schemas.Task,
)
async def delete_task_note(
    session: Session,
    task_id: int,
    note_id: int,
):
    """Delete a note from an annotation task."""
    task = await api.tasks.remove_note(
        session,
        task_id,
        note_id,
    )
    await session.commit()
    return task


@tasks_router.get(
    "/notes/",
    response_model=schemas.Page[schemas.TaskNote],
)
async def get_task_notes(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: TaskNoteFilter = Depends(TaskNoteFilter),  # type: ignore
):
    """Get a page of task notes."""
    notes, total = await api.tasks.get_notes(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=notes,
        total=total,
        offset=offset,
        limit=limit,
    )


@tasks_router.get(
    "/tags/",
    response_model=schemas.Page[schemas.TaskTag],
)
async def get_task_tags(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: TaskTagFilter = Depends(TaskTagFilter),  # type: ignore
):
    """Get a page of task tags."""
    tags, total = await api.tasks.get_tags(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tags,
        total=total,
        offset=offset,
        limit=limit,
    )


@tasks_router.get(
    "/detail/",
    response_model=schemas.Task,
)
async def get_task(
    session: Session,
    task_id: int,
):
    """Get an annotation task."""
    task = await api.tasks.get_by_id(session, task_id)
    return task


@tasks_router.post(
    "/detail/tags/",
    response_model=schemas.Task,
)
async def add_task_tag(
    session: Session,
    task_id: int,
    tag_id: int,
    user: ActiveUser,
):
    """Create a tag for an annotation task."""
    task = await api.tasks.add_tag(
        session,
        task_id,
        tag_id,
        user.id,
    )
    await session.commit()
    return task


@tasks_router.delete(
    "/detail/tags/",
    response_model=schemas.Task,
)
async def remove_task_tag(
    session: Session,
    task_id: int,
    tag_id: int,
):
    """Remove a tag from an annotation task."""
    task = await api.tasks.remove_tag(
        session,
        task_id,
        tag_id,
    )
    await session.commit()
    return task


@tasks_router.post(
    "/detail/notes/",
    response_model=schemas.Task,
)
async def add_task_note(
    session: Session,
    task_id: int,
    data: schemas.NoteCreate,
    user: ActiveUser,
):
    """Add a note to an annotation task."""
    note = await api.notes.create(
        session,
        schemas.NotePostCreate(
            created_by_id=user.id,
            **dict(data),
        ),
    )
    task = await api.tasks.add_note(
        session,
        task_id,
        note.id,
    )
    await session.commit()
    return task


@tasks_router.patch(
    "/detail/notes/",
    response_model=schemas.Task,
)
async def update_task_note(
    session: Session,
    task_id: int,
    note_id: int,
    data: schemas.NoteUpdate,
):
    """Update a note on an annotation task."""
    task = await api.tasks.update_note(
        session,
        task_id,
        note_id,
        data,
    )
    await session.commit()
    return task


@tasks_router.post(
    "/detail/badges/",
    response_model=schemas.Task,
)
async def add_task_badge(
    session: Session,
    task_id: int,
    state: Annotated[TaskState, Body(embed=True)],
    user: ActiveUser,
):
    """Add a badge to an annotation task."""
    task = await api.tasks.add_status_badge(
        session,
        task_id,
        user.id,
        state,
    )
    await session.commit()
    return task


@tasks_router.delete(
    "/detail/badges/",
    response_model=schemas.Task,
)
async def remove_task_badge(
    session: Session,
    task_id: int,
    badge_id: int,
):
    """Remove a badge from an annotation task."""
    task = await api.tasks.remove_status_badge(
        session,
        task_id,
        badge_id,
    )
    await session.commit()
    return task
