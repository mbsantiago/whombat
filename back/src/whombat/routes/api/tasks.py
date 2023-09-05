"""REST API routes for annotation tasks."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.tasks import TaskFilter
from whombat.routes.types import Limit, Offset

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
