"""REST API routes for Sound Event Predictions."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.clip_evaluations import ClipEvaluationFilter
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

clip_evaluations_router = APIRouter()

__all__ = [
    "clip_evaluations_router",
]


@clip_evaluations_router.get(
    "/",
    response_model=schemas.Page[schemas.ClipEvaluation],
)
async def get_clip_evaluations(
    session: Session,
    offset: Offset = 0,
    limit: Limit = 100,
    filter: ClipEvaluationFilter = Depends(ClipEvaluationFilter),  # type: ignore
) -> schemas.Page[schemas.ClipEvaluation]:
    """Get a page of clip evaluations."""
    (
        clip_evaluations,
        total,
    ) = await api.clip_evaluations.get_many(
        session=session,
        offset=offset,
        limit=limit,
        filters=[filter],
    )
    return schemas.Page(
        items=clip_evaluations,
        offset=offset,
        limit=limit,
        total=total,
    )


@clip_evaluations_router.get(
    "/detail/",
    response_model=schemas.ClipEvaluation,
)
async def get_clip_evaluation(
    session: Session,
    clip_evaluation_uuid: UUID,
) -> schemas.ClipEvaluation:
    """Get a single clip evaluation."""
    return await api.clip_evaluations.get(
        session,
        clip_evaluation_uuid,
    )
