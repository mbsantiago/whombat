"""Schemas for handling Tags."""
from pydantic import BaseModel

__all__ = [
    "Tag",
]


class Tag(BaseModel):
    """Schema for Tag objects returned to the user."""

    key: str
    value: float

    class Config:
        """Pydantic configuration."""

        orm_mode = True
