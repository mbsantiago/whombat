"""Schemas for Evaluations."""
from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema

__all__ = [
    "EvaluationMetricCreate",
    "EvaluationMetric",
    "EvaluationCreate",
    "Evaluation",
]


class EvaluationMetricCreate(BaseSchema):
    """Evaluation metric creation schema."""

    evaluation_id: int
    """Evaluation ID."""

    name: str
    """Name of the metric."""

    value: float
    """Value of the metric."""


class EvaluationMetric(EvaluationMetricCreate):
    """Evaluation metric schema."""

    id: int
    """Evaluation metric identifier."""


class EvaluationCreate(BaseSchema):
    """Evaluation creation schema."""

    uuid: UUID = Field(default_factory=uuid4)
    """Unique identifier of the evaluation."""

    score: float = Field(default=0, ge=0, le=1)
    """Overall score of the evaluation."""


class Evaluation(EvaluationCreate):
    """Evaluation schema."""

    id: int
    """Dataset identifier of the evaluation."""

    metrics: list[EvaluationMetric] = Field(default_factory=list)
    """List of metrics of the evaluation."""
