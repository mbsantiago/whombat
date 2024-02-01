"""Schemas for Evaluations."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature

__all__ = [
    "EvaluationCreate",
    "Evaluation",
    "EvaluationUpdate",
]


class EvaluationCreate(BaseModel):
    """Evaluation creation schema."""

    score: float = Field(default=0, ge=0, le=1)
    """Overall score of the evaluation."""

    task: str
    """Task of the evaluation."""


class Evaluation(BaseSchema):
    """Evaluation schema."""

    uuid: UUID

    id: int = Field(..., exclude=True)
    """Dataset identifier of the evaluation."""

    score: float
    """Overall score of the evaluation."""

    task: str
    """Task of the evaluation."""

    metrics: list[Feature] = Field(default_factory=list)
    """List of metrics of the evaluation."""


class EvaluationUpdate(BaseModel):
    """Evaluation update schema."""

    uuid: UUID | None = None
    """Unique identifier of the evaluation."""

    score: float | None = None
    """Overall score of the evaluation."""

    task: str | None = None
    """Task of the evaluation."""
