"""Schemas for handling Features."""

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema

__all__ = [
    "Feature",
    "FeatureName",
    "FeatureNameCreate",
    "FeatureNameUpdate",
]


class FeatureNameCreate(BaseModel):
    """Schema for FeatureName objects created by the user."""

    name: str
    """The name of the feature."""


class FeatureName(BaseSchema):
    """Schema for FeatureName objects returned to the user."""

    id: int = Field(..., exclude=True)
    """The database id of the feature name."""

    name: str
    """The name of the feature."""


class FeatureNameUpdate(BaseModel):
    """Schema for FeatureName objects updated by the user."""

    name: str
    """The name of the feature."""


class Feature(BaseSchema):
    """Schema for Feature objects returned to the user."""

    name: str
    """The name of the feature."""

    value: float
    """The value of the feature."""

    def __hash__(self):
        """Hash the Feature object."""
        return hash((self.name, self.value))
