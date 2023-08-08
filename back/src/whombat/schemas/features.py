"""Schemas for handling Features."""
from pydantic import BaseModel, ConfigDict

__all__ = [
    "Feature",
]


class Feature(BaseModel):
    """Schema for Feature objects returned to the user."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    value: float

    def __hash__(self):
        """Hash the Feature object."""
        return hash((self.name, self.value))
