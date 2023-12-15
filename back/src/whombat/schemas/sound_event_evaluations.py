"""Schemas for Sound Event Evaluation related objects."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.sound_event_annotations import SoundEventAnnotation
from whombat.schemas.sound_event_predictions import SoundEventPrediction

__all__ = [
    "SoundEventEvaluation",
    "SoundEventEvaluationCreate",
    "SoundEventEvaluationUpdate",
]


class SoundEventEvaluationCreate(BaseModel):
    """Schema for creating a new sound event evaluation."""

    affinity: float
    """Affinity of the match between the source and target."""

    score: float
    """Overall score of the evaluation."""


class SoundEventEvaluation(BaseSchema):
    """Schema for a sound event evaluation."""

    uuid: UUID

    id: int = Field(..., exclude=True)
    """Database ID of the evaluation."""

    source: SoundEventPrediction | None
    """Source sound event prediction."""

    target: SoundEventAnnotation | None
    """Target sound event annotation."""

    affinity: float
    """Affinity of the match between the source and target."""

    score: float
    """Overall score of the evaluation."""

    metrics: list[Feature] = Field(default_factory=list)
    """Evaluation metrics."""


class SoundEventEvaluationUpdate(BaseSchema):
    """Schema for updating a sound event evaluation."""

    affinity: float | None = None
    """Affinity of the match between the source and target."""

    score: float | None = None
    """Overall score of the evaluation."""

    uuid: UUID | None = None
    """UUID of the Sound Event Evaluation."""
