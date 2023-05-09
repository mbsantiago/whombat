"""Schemas for handling Features."""
from pydantic import BaseModel

__all__ = [
    "Feature",
]


class Feature(BaseModel):
    """Schema for Feature objects returned to the user."""

    name: str
    value: float

    class Config:
        """Pydantic configuration."""

        orm_mode = True

    def __hash__(self):
        """Hash the Feature object."""
        return hash((self.name, self.value))
