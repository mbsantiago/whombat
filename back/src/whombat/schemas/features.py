"""Schemas for handling Features."""

from pydantic import BaseModel, ConfigDict, Field

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


class Feature(BaseModel):
    """Schema for Feature objects returned to the user."""

    name: str
    """The name of the feature."""

    value: float
    """The value of the feature."""

    model_config = ConfigDict(from_attributes=True)

    def __hash__(self):
        """Hash the Feature object."""
        return hash((self.name, self.value))
