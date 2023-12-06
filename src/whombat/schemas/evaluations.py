"""Schemas for Evaluations."""
from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature

__all__ = [
    "EvaluationMetricCreate",
    "EvaluationCreate",
    "Evaluation",
    "EvaluationUpdate",
]


class EvaluationMetricCreate(BaseSchema):
    """Evaluation metric creation schema."""

    evaluation_id: int
    """Evaluation ID."""

    feature_name_id: int
    """Feature name ID."""

    value: float
    """Value of the metric."""


class EvaluationCreate(BaseSchema):
    """Evaluation creation schema."""

    uuid: UUID = Field(default_factory=uuid4)
    """Unique identifier of the evaluation."""

    score: float = Field(default=0, ge=0, le=1)
    """Overall score of the evaluation."""

    task: str
    """Task of the evaluation."""


class Evaluation(EvaluationCreate):
    """Evaluation schema."""

    id: int
    """Dataset identifier of the evaluation."""

    metrics: list[Feature] = Field(default_factory=list)
    """List of metrics of the evaluation."""


class EvaluationUpdate(BaseSchema):
    """Evaluation update schema."""

    uuid: UUID | None = None
    """Unique identifier of the evaluation."""

    score: float | None = None
    """Overall score of the evaluation."""

    task: str | None = None
    """Task of the evaluation."""
