"""Schemas for handling Tags."""
from pydantic import BaseModel, Field

__all__ = [
    "Tag",
    "TagCreate",
    "TagUpdate"
]


class Tag(BaseModel):
    """Schema for Tag objects returned to the user."""

    id: int
    key: str
    value: str

    class Config:
        """Pydantic configuration."""

        orm_mode = True


class TagCreate(BaseModel):
    """Schema for creating Tag objects."""

    key: str = Field(..., min_length=1, max_length=255)
    value: str = Field(..., min_length=1, max_length=255)


class TagUpdate(BaseModel):
    """Schema for updating Tag objects."""

    key: str | None = Field(None, min_length=1, max_length=255)
    value: str | None = Field(None, min_length=1, max_length=255)
