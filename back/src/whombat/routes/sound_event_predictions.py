"""REST API routes for Sound Event Predictions."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.sound_event_predictions import SoundEventPredictionFilter
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

__all__ = [
    "sound_event_predictions_router",
]


sound_event_predictions_router = APIRouter()


@sound_event_predictions_router.post(
    "/",
    response_model=schemas.SoundEventPrediction,
)
async def create_sound_event_prediction(
    session: Session,
    clip_prediction_uuid: UUID,
    data: schemas.SoundEventPredictionCreate,
):
    """Create a sound event prediction."""
    clip_prediction = await api.clip_predictions.get(
        session,
        clip_prediction_uuid,
    )
    sound_event = await api.sound_events.create(
        session,
        recording=clip_prediction.clip.recording,
        geometry=data.geometry,
    )
    sound_event_prediction = await api.sound_event_predictions.create(
        session,
        sound_event=sound_event,
        clip_prediction=clip_prediction,
        score=data.score,
    )
    await session.commit()
    return sound_event_prediction


@sound_event_predictions_router.get(
    "/",
    response_model=schemas.Page[schemas.SoundEventPrediction],
)
async def get_sound_event_predictions(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: SoundEventPredictionFilter = Depends(SoundEventPredictionFilter),  # type: ignore
    sort_by: str = "-created_on",
):
    """Get a page of sound event predictions."""
    (
        sound_event_predictions,
        total,
    ) = await api.sound_event_predictions.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=sound_event_predictions,
        total=total,
        limit=limit,
        offset=offset,
    )


@sound_event_predictions_router.delete(
    "/detail/",
    response_model=schemas.SoundEventPrediction,
)
async def delete_sound_event_prediction(
    session: Session,
    sound_event_prediction_uuid: UUID,
):
    """Delete an sound event prediction."""
    sound_event_prediction = await api.sound_event_predictions.get(
        session,
        sound_event_prediction_uuid,
    )
    sound_event_annotaiton = await api.sound_event_predictions.delete(
        session,
        sound_event_prediction,
    )
    await session.commit()
    return sound_event_annotaiton


@sound_event_predictions_router.post(
    "/detail/tags/",
    response_model=schemas.SoundEventPrediction,
)
async def add_predicted_tag(
    session: Session,
    sound_event_prediction_uuid: UUID,
    key: str,
    value: str,
    score: float,
):
    """Add a tag to a sound event prediction."""
    sound_event_prediction = await api.sound_event_predictions.get(
        session,
        sound_event_prediction_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    sound_event_prediction = await api.sound_event_predictions.add_tag(
        session,
        sound_event_prediction,
        tag,
        score,
    )
    await session.commit()
    return sound_event_prediction


@sound_event_predictions_router.delete(
    "/detail/tags/",
    response_model=schemas.SoundEventPrediction,
)
async def remove_predicted_tag(
    session: Session,
    sound_event_prediction_uuid: UUID,
    key: str,
    value: str,
):
    """Remove a tag from an sound event prediction."""
    sound_event_prediction = await api.sound_event_predictions.get(
        session,
        sound_event_prediction_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    sound_event_prediction = await api.sound_event_predictions.remove_tag(
        session,
        sound_event_prediction,
        tag,
    )
    await session.commit()
    return sound_event_prediction
