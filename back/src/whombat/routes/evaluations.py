"""REST API routes for Sound Event Predictions."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.evaluations import EvaluationFilter
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

evaluations_router = APIRouter()

__all__ = [
    "evaluations_router",
]


@evaluations_router.get(
    "/",
    response_model=schemas.Page[schemas.Evaluation],
)
async def get_evaluations(
    session: Session,
    offset: Offset = 0,
    limit: Limit = 100,
    filter: EvaluationFilter = Depends(EvaluationFilter),  # type: ignore
) -> schemas.Page[schemas.Evaluation]:
    """Get a page of evaluations."""
    (
        evaluations,
        total,
    ) = await api.evaluations.get_many(
        session=session,
        offset=offset,
        limit=limit,
        filters=[filter],
    )
    return schemas.Page(
        items=evaluations,
        offset=offset,
        limit=limit,
        total=total,
    )


@evaluations_router.get(
    "/detail/",
    response_model=schemas.Evaluation,
)
async def get_evaluation(
    session: Session,
    evaluation_uuid: UUID,
) -> schemas.Evaluation:
    """Get an evaluation by id."""
    return await api.evaluations.get(session, evaluation_uuid)


@evaluations_router.post(
    "/",
    response_model=schemas.Evaluation,
)
async def create_evaluation(
    session: Session,
    data: schemas.EvaluationCreate,
) -> schemas.Evaluation:
    """Create a new evaluation."""
    return await api.evaluations.create(
        session,
        task=data.task,
        score=data.score,
    )


@evaluations_router.delete(
    "/detail/",
    response_model=schemas.Evaluation,
)
async def delete_evaluation(
    session: Session,
    evaluation_uuid: UUID,
) -> schemas.Evaluation:
    """Delete an evaluation."""
    evaluation = await api.evaluations.get(session, evaluation_uuid)
    return await api.evaluations.delete(
        session,
        evaluation,
    )
