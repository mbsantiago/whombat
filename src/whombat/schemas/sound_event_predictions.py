"""Schemas for Sound Event Predictions related objects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.sound_events import SoundEvent
from whombat.schemas.tags import Tag

__all__ = [
    "SoundEventPrediction",
    "SoundEventPredictionCreate",
    "SoundEventPredictionTag",
    "SoundEventPredictionTagCreate",
    "SoundEventPredictionUpdate",
]


class SoundEventPredictionCreate(BaseSchema):
    """Schema for creating a new sound event prediction."""

    clip_prediction_id: int
    """ID of the clip prediction to which the sound event prediction
    belongs."""

    sound_event_id: int
    """ID of the sound event to be predicted."""

    score: float
    """Overall score of the prediction."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the prediction."""


class SoundEventPredictionTagCreate(BaseSchema):
    """Schema for creating a new sound event prediction tag."""

    sound_event_prediction_id: int
    """ID of the sound event prediction to which the tag belongs."""

    tag_id: int
    """ID of the tag."""

    score: float
    """The confidence score of the tag."""


class SoundEventPredictionTag(SoundEventPredictionTagCreate):
    """Schema for a sound event prediction tag."""

    id: int
    """Database ID of the tag."""

    tag: Tag
    """Tag."""


class SoundEventPrediction(SoundEventPredictionCreate):
    """Schema for a sound event prediction."""

    id: int
    """Database ID of the prediction."""

    sound_event: SoundEvent
    """Sound event to be predicted."""

    predicted_tags: list[SoundEventPredictionTag] = []
    """Tags of the prediction."""


class SoundEventPredictionUpdate(BaseSchema):
    """Schema for updating a sound event prediction."""

    uuid: UUID | None
    """UUID of the prediction.""" ""

    score: float | None
    """Overall score of the prediction."""
