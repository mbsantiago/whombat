"""Schemas for handling Evaluation Sets."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.tags import Tag

__all__ = [
    "EvaluationSet",
    "EvaluationSetCreate",
    "EvaluationSetUpdate",
]


class EvaluationSetCreate(BaseModel):
    """Schema for creating EvaluationSet objects."""

    name: str = Field(..., min_length=1)
    """The name of the evaluation set."""

    description: str | None = Field(default=None)
    """The description of the evaluation set."""

    task: str = Field(..., min_length=1)
    """The name of the task the evaluation set is used for."""


class EvaluationSet(BaseSchema):
    """Schema for EvaluationSet objects returned to the user."""

    uuid: UUID
    """The uuid of the evaluation set."""

    id: int = Field(..., exclude=True)
    """The id of the evaluation set."""

    name: str
    """The name of the evaluation set."""

    description: str | None
    """The description of the evaluation set."""

    task: str
    """The name of the task the evaluation set is used for."""

    tags: list[Tag] = Field(default_factory=list)
    """The tags to use for the evaluation set."""


class EvaluationSetUpdate(BaseModel):
    """Schema for updating EvaluationSet objects."""

    name: str | None = Field(default=None, min_length=1)
    """The name of the evaluation set."""

    description: str | None = None
    """The description of the evaluation set."""
