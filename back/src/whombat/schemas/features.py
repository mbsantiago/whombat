"""Schemas for handling Features."""

from whombat.schemas.base import BaseSchema

__all__ = [
    "Feature",
]


class FeatureNameCreate(BaseSchema):
    """Schema for FeatureName objects created by the user."""

    name: str
    """The name of the feature."""


class FeatureName(FeatureNameCreate):
    """Schema for FeatureName objects returned to the user."""

    id: int
    """The database id of the feature name."""


class Feature(BaseSchema):
    """Schema for Feature objects returned to the user."""

    feature_name: FeatureName
    """The name of the feature."""

    value: float
    """The value of the feature."""

    def __hash__(self):
        """Hash the Feature object."""
        return hash((self.feature_name.name, self.value))
