"""Schemas for Sound Event Evaluation related objects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.sound_event_annotations import SoundEventAnnotation
from whombat.schemas.sound_event_predictions import SoundEventPrediction

__all__ = [
    "SoundEventEvaluation",
    "SoundEventEvaluationCreate",
    "SoundEventEvaluationMetricCreate",
]


class SoundEventEvaluationCreate(BaseSchema):
    """Schema for creating a new sound event evaluation."""

    clip_evaluation_id: int
    """ID of the clip evaluation to which the sound event evaluation
    belongs."""

    source_id: int | None 
    """ID of the source sound event prediction."""

    target_id: int | None
    """ID of the target sound event annotation."""

    affinity: float
    """Affinity of the match between the source and target."""

    score: float
    """Overall score of the evaluation."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the Sound Event Evaluation."""


class SoundEventEvaluation(SoundEventEvaluationCreate):
    """Schema for a sound event evaluation."""

    id: int
    """Database ID of the evaluation."""

    source: SoundEventPrediction | None
    """Source sound event prediction."""

    target: SoundEventAnnotation | None
    """Target sound event annotation."""

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


class SoundEventEvaluationMetricCreate(BaseSchema):
    """Schema for creating a new sound event evaluation metric."""

    sound_event_evaluation_id: int
    """ID of the sound event evaluation to which the metric belongs."""

    feature_name_id: int
    """ID of the feature name."""

    value: float
    """Value of the metric."""
