"""Schemas for Clip Evaluation related objects."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.clip_annotations import ClipAnnotation
from whombat.schemas.clip_predictions import ClipPrediction
from whombat.schemas.features import Feature
from whombat.schemas.sound_event_evaluations import SoundEventEvaluation

__all__ = [
    "ClipEvaluation",
    "ClipEvaluationCreate",
    "ClipEvaluationUpdate",
]


class ClipEvaluationCreate(BaseModel):
    """Schema for creating a new Clip Evaluation."""

    score: float
    """Overall score of the evaluation."""


class ClipEvaluation(BaseSchema):
    uuid: UUID
    """UUID of the Clip Evaluation."""

    id: int = Field(..., exclude=True)
    """Database ID of the evaluation."""

    clip_annotation: ClipAnnotation
    """Clip annotation used for the evaluation."""

    clip_prediction: ClipPrediction
    """Clip prediction being evaluated."""

    sound_event_evaluations: list[SoundEventEvaluation] = Field(
        default_factory=list
    )
    """The evaluation of the sound events within the clip."""

    metrics: list[Feature] = Field(default_factory=list)
    """Evaluation metrics."""

    score: float
    """Overall score of the evaluation."""


class ClipEvaluationUpdate(BaseModel):
    """Schema for updating an existing Clip Evaluation."""

    score: float | None = None
    """Overall score of the evaluation."""

    uuid: UUID | None = None
    """UUID of the Clip Evaluation."""
