"""Schemas for handling Evaluation Sets."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.tags import Tag

__all__ = [
    "EvaluationSet",
    "EvaluationSetCreate",
    "EvaluationSetUpdate",
]


class EvaluationSetCreate(BaseSchema):
    """Schema for creating EvaluationSet objects."""

    uuid: UUID = Field(default_factory=uuid4)
    """The unique identifier of the evaluation set."""

    name: str = Field(..., min_length=1)
    """The name of the evaluation set."""

    description: str | None = Field(default=None)
    """The description of the evaluation set."""


class EvaluationSet(EvaluationSetCreate):
    """Schema for EvaluationSet objects returned to the user."""

    id: int
    """The id of the evaluation set."""

    tags: list[Tag] = Field(default_factory=list)
    """The tags to use for the evaluation set."""


class EvaluationSetUpdate(BaseSchema):
    """Schema for updating EvaluationSet objects."""

    name: str | None = Field(default=None, min_length=1)
    description: str | None = None
