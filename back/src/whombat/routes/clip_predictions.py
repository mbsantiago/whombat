"""REST API routes for Clip Predictions."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.clip_predictions import ClipPredictionFilter
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

__all__ = [
    "clip_predictions_router",
]


clip_predictions_router = APIRouter()


@clip_predictions_router.post(
    "/",
    response_model=schemas.ClipPrediction,
)
async def create_clip_prediction(
    session: Session,
    clip_uuid: UUID,
    data: schemas.ClipPredictionCreate,
):
    """Create a clip prediction."""
    clip = await api.clips.get(session, clip_uuid)
    clip_prediction = await api.clip_predictions.create(
        session,
        clip=clip,
    )
    for predicted_tag in data.tags:
        tag = await api.tags.get_or_create(
            session,
            key=predicted_tag.tag.key,
            value=predicted_tag.tag.value,
        )
        clip_prediction = await api.clip_predictions.add_tag(
            session,
            clip_prediction,
            tag,
            predicted_tag.score,
        )
    await session.commit()
    return clip_prediction


@clip_predictions_router.get(
    "/",
    response_model=schemas.Page[schemas.ClipPrediction],
)
async def get_clip_predictions(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: ClipPredictionFilter = Depends(ClipPredictionFilter),  # type: ignore
    sort_by: str = "-created_on",
):
    """Get a page of clip predictions."""
    (
        clip_predictions,
        total,
    ) = await api.clip_predictions.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=clip_predictions,
        total=total,
        limit=limit,
        offset=offset,
    )


@clip_predictions_router.delete(
    "/detail/",
    response_model=schemas.ClipPrediction,
)
async def delete_clip_prediction(
    session: Session,
    clip_prediction_uuid: UUID,
):
    """Delete a clip prediction."""
    clip_prediction = await api.clip_predictions.get(
        session,
        clip_prediction_uuid,
    )
    clip_annotaiton = await api.clip_predictions.delete(
        session,
        clip_prediction,
    )
    await session.commit()
    return clip_annotaiton


@clip_predictions_router.post(
    "/detail/tags/",
    response_model=schemas.ClipPrediction,
)
async def add_predicted_tag(
    session: Session,
    clip_prediction_uuid: UUID,
    key: str,
    value: str,
    score: float,
):
    """Add a tag to a clip prediction."""
    clip_prediction = await api.clip_predictions.get(
        session,
        clip_prediction_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    clip_prediction = await api.clip_predictions.add_tag(
        session,
        clip_prediction,
        tag,
        score,
    )
    await session.commit()
    return clip_prediction


@clip_predictions_router.delete(
    "/detail/tags/",
    response_model=schemas.ClipPrediction,
)
async def remove_predicted_tag(
    session: Session,
    clip_prediction_uuid: UUID,
    key: str,
    value: str,
):
    """Remove a tag from a clip prediction."""
    clip_prediction = await api.clip_predictions.get(
        session,
        clip_prediction_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    clip_prediction = await api.clip_predictions.remove_tag(
        session,
        clip_prediction,
        tag,
    )
    await session.commit()
    return clip_prediction
