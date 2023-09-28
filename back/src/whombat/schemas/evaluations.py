"""Schemas for Evaluations."""
from pydantic import Field

from whombat.schemas.base import BaseSchema

__all__ = [
    "EvaluationMetricCreate",
    "EvaluationMetric",
    "EvaluationMetricUpdate",
    "EvaluationCreate",
    "Evaluation",
    "EvaluationUpdate",
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


class EvaluationMetricUpdate(BaseSchema):
    """Evaluation metric update schema."""

    value: float
    """Value of the metric."""


class EvaluationCreate(BaseSchema):
    """Evaluation creation schema."""

    prediction_run_id: int
    """Model Run ID."""

    score: float = Field(default=0, ge=0, le=1)
    """Overall score of the evaluation."""


class Evaluation(EvaluationCreate):
    """Evaluation schema."""

    id: int
    """Dataset identifier of the evaluation."""

    metrics: list[EvaluationMetric] = Field(default_factory=list)
    """List of metrics of the evaluation."""


class EvaluationUpdate(BaseSchema):
    """Evaluation update schema."""

    score: float = Field(default=0, ge=0, le=1)
    """Overall score of the evaluation."""
