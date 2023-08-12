"""Schemas for handling Tags."""
from pydantic import Field

from whombat.schemas.base import BaseSchema

__all__ = ["Tag", "TagCreate", "TagUpdate"]


class TagCreate(BaseSchema):
    """Schema for creating Tag objects."""

    key: str = Field(min_length=1, max_length=255)
    value: str = Field(min_length=1, max_length=255)


class Tag(TagCreate):
    """Schema for Tag objects returned to the user."""

    id: int

    def __hash__(self):
        """Hash the Tag object."""
        return hash((self.key, self.value))


class TagUpdate(BaseSchema):
    """Schema for updating Tag objects."""

    key: str | None = Field(default=None, min_length=1, max_length=255)
    value: str | None = Field(default=None, min_length=1, max_length=255)
