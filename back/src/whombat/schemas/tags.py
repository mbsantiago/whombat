"""Schemas for handling Tags."""
from pydantic import Field

from whombat.schemas.base import BaseSchema

__all__ = [
    "Tag",
    "TagCreate",
    "TagUpdate",
]


class TagCreate(BaseSchema):
    """Schema for creating Tag objects."""

    key: str = Field(min_length=1, max_length=255)
    """Key of the tag."""

    value: str = Field(min_length=1, max_length=255)
    """Value of the tag."""


class Tag(TagCreate):
    """Schema for Tag objects returned to the user."""

    id: int
    """Database ID of the tag."""


class TagUpdate(BaseSchema):
    """Schema for updating Tag objects."""

    key: str | None = Field(default=None, min_length=1, max_length=255)
    value: str | None = Field(default=None, min_length=1, max_length=255)
