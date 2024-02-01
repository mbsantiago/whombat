"""Schemas for handling Tags."""

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema

__all__ = [
    "Tag",
    "TagCreate",
    "TagUpdate",
    "PredictedTag",
]


class TagCreate(BaseModel):
    """Schema for creating Tag objects."""

    key: str = Field(min_length=1, max_length=255)
    """Key of the tag."""

    value: str = Field(min_length=1, max_length=255)
    """Value of the tag."""


class Tag(BaseSchema):
    """Schema for Tag objects returned to the user."""

    id: int = Field(..., exclude=True)
    """Database ID of the tag."""

    key: str
    """Key of the tag."""

    value: str
    """Value of the tag."""


class TagUpdate(BaseModel):
    """Schema for updating Tag objects."""

    key: str | None = Field(default=None, min_length=1, max_length=255)
    """Key of the tag."""

    value: str | None = Field(default=None, min_length=1, max_length=255)
    """Value of the tag."""


class PredictedTag(BaseSchema):
    """Schema for PredictedTag objects returned to the user."""

    tag: Tag
    """The tag that was predicted."""

    score: float
    """The confidence score for the assignment of the tag."""
