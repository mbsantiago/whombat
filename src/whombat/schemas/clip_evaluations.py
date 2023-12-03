"""Schemas for Clip Evaluation related objects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.clip_annotations import ClipAnnotation
from whombat.schemas.clip_predictions import ClipPrediction
from whombat.schemas.features import Feature
from whombat.schemas.sound_event_evaluations import SoundEventEvaluation

__all__ = [
    "ClipEvaluation",
    "ClipEvaluationCreate",
    "ClipEvaluationMetricCreate",
]


class ClipEvaluationCreate(BaseSchema):
    """Schema for creating a new Clip Evaluation."""

    clip_annotation_id: int
    """ID of the clip annotation used for the evaluation."""

    clip_prediction_id: int
    """ID of the clip prediction being evaluated."""

    score: float
    """Overall score of the evaluation."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the Clip Evaluation."""


class ClipEvaluation(ClipEvaluationCreate):
    id: int
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


class ClipEvaluationMetricCreate(BaseSchema):
    clip_evaluation_id: int

    feature_name_id: int
    """ID of the feature name."""

    value: float
    """Value of the metric."""
