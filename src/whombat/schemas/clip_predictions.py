"""Schemas for Clip Prediction related objects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.clips import Clip
from whombat.schemas.sound_event_predictions import SoundEventPrediction
from whombat.schemas.tags import Tag

__all__ = [
    "ClipPrediction",
    "ClipPredictionCreate",
    "ClipPredictionTag",
    "ClipPredictionTagCreate",
]


class ClipPredictionCreate(BaseSchema):
    """Schema for creating a new clip prediction."""

    clip_id: int
    """ID of the clip to which this prediction belongs."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the prediction."""


class ClipPredictionTagCreate(BaseSchema):
    """Schema for creating a new clip prediction tag."""

    clip_prediction_id: int
    """ID of the clip prediction to which the tag belongs."""

    tag_id: int
    """ID of the tag."""

    score: float
    """The confidence score of the tag."""


class ClipPredictionTag(ClipPredictionTagCreate):
    """Schema for a clip prediction tag."""

    id: int
    """Database ID of the tag."""

    tag: Tag
    """Tag."""


class ClipPrediction(ClipPredictionCreate):
    """Schema for a clip prediction."""

    id: int
    """Database ID of the prediction."""

    clip: Clip
    """Clip to which this prediction belongs."""

    sound_events: list[SoundEventPrediction] = Field(default_factory=list)
    """Sound event predictions of the clip."""

    predicted_tags: list[ClipPredictionTag] = Field(default_factory=list)
    """Tags of the prediction."""
