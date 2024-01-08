"""Schemas for Sound Event Predictions related objects."""

from uuid import UUID

from pydantic import BaseModel, Field
from soundevent.data import Geometry

from whombat.schemas.base import BaseSchema
from whombat.schemas.sound_events import SoundEvent
from whombat.schemas.tags import Tag

__all__ = [
    "SoundEventPrediction",
    "SoundEventPredictionCreate",
    "SoundEventPredictionTag",
    "SoundEventPredictionUpdate",
]


class SoundEventPredictionCreate(BaseModel):
    """Schema for creating a new sound event prediction."""

    geometry: Geometry = Field(..., discriminator="type")
    """Geometry of this sound event prediction."""

    score: float
    """Overall score of the prediction."""


class SoundEventPredictionTag(BaseSchema):
    """Schema for a sound event prediction tag."""

    score: float
    """Score of the tag."""

    tag: Tag
    """Tag."""


class SoundEventPrediction(BaseSchema):
    """Schema for a sound event prediction."""

    uuid: UUID
    """UUID of the prediction."""

    id: int = Field(..., exclude=True)
    """Database ID of the prediction."""

    sound_event: SoundEvent
    """Sound event to be predicted."""

    score: float
    """Overall score of the prediction."""

    tags: list[SoundEventPredictionTag] = Field(default_factory=list)
    """Tags of the prediction."""


class SoundEventPredictionUpdate(BaseModel):
    """Schema for updating a sound event prediction."""

    uuid: UUID | None
    """UUID of the prediction.""" ""

    score: float | None
    """Overall score of the prediction."""
