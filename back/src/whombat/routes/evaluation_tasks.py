"""REST API routes for evaluation tasks."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.evaluation_tasks import EvaluationTaskFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "evaluation_tasks_router",
]


evaluation_tasks_router = APIRouter()


@evaluation_tasks_router.get(
    "/",
    response_model=schemas.Page[schemas.EvaluationTask],
)
async def get_evaluation_tasks(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: EvaluationTaskFilter = Depends(EvaluationTaskFilter),  # type: ignore
    sort_by: str = "-created_at",
):
    """Get a page of evaluation_tasks."""
    tasks, total = await api.evaluation_tasks.get_many(
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


@evaluation_tasks_router.post(
    "/",
    response_model=list[schemas.EvaluationTask],
)
async def create_evaluation_tasks(
    session: Session,
    data: list[schemas.EvaluationTaskCreate],
):
    """Create multiple evaluation_tasks."""
    evaluation_tasks = await api.evaluation_tasks.create_many(
        session,
        data,
    )
    await session.commit()
    return evaluation_tasks


@evaluation_tasks_router.get(
    "/detail/",
    response_model=schemas.EvaluationTask,
)
async def get_evaluation_task(
    session: Session,
    evaluation_task_id: int,
):
    """Get a evaluation_task."""
    task = await api.evaluation_tasks.get_by_id(session, evaluation_task_id)
    return task


@evaluation_tasks_router.delete(
    "/detail/",
    response_model=schemas.Task,
)
async def delete_evaluation_task(
    session: Session,
    evaluation_task_id: int,
):
    """Delete a evaluation_task."""
    task = await api.evaluation_tasks.delete(session, evaluation_task_id)
    await session.commit()
    return task
