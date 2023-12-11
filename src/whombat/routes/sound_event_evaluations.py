"""REST API routes for Sound Event Predictions."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.sound_event_predictions import SoundEventPredictionFilter
from whombat.routes.types import Limit, Offset

sound_event_evaluations_router = APIRouter()

__all__ = [
    "sound_event_evaluations_router",
]


@sound_event_evaluations_router.get(
    "/",
    response_model=schemas.Page[schemas.SoundEventEvaluation],
)
async def get_sound_event_evaluations(
    session: Session,
    offset: Offset = 0,
    limit: Limit = 100,
    filter: SoundEventPredictionFilter = Depends(SoundEventPredictionFilter),  # type: ignore
) -> schemas.Page[schemas.SoundEventEvaluation]:
    """Get a page of sound event evaluations."""
    (
        sound_event_evaluations,
        total,
    ) = await api.sound_event_evaluations.get_many(
        session=session,
        offset=offset,
        limit=limit,
        filters=[filter],
    )
    return schemas.Page(
        items=sound_event_evaluations,
        offset=offset,
        limit=limit,
        total=total,
    )
