"""Schemas for handling clips."""

from uuid import UUID, uuid4

from pydantic import Field, model_validator

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.recordings import Recording

__all__ = [
    "Clip",
    "ClipCreate",
    "ClipFeatureCreate",
    "ClipUpdate",
]


class ClipCreate(BaseSchema):
    """Schema for creating a clip."""

    uuid: UUID = Field(default_factory=uuid4)
    """The unique identifier of the clip."""

    recording_id: int
    """The id of the recording to which the clip belongs."""

    start_time: float
    """The start time of the clip."""

    end_time: float
    """The end time of the clip."""

    @model_validator(mode="after")
    def validate_times(cls, values):
        """Validate that start_time < end_time."""
        if values.start_time > values.end_time:
            raise ValueError("start_time must be less than end_time")
        return values


class Clip(ClipCreate):
    """Schema for Clip objects returned to the user."""

    id: int
    """The database id of the clip."""

    recording: Recording
    """Recording information for the clip."""

    features: list[Feature] = Field(default_factory=list)
    """The features associated with the clip."""


class ClipUpdate(BaseSchema):
    """Schema for updating a clip."""

    uuid: UUID | None = None
    """The unique identifier of the clip."""


class ClipFeatureCreate(BaseSchema):
    """Schema for creating a clip feature."""

    clip_id: int
    """The id of the clip to which the feature belongs."""

    feature_name_id: int
    """The id of the feature name."""

    value: float
    """The value of the feature."""
