"""Schemas for handling clips."""

from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.recordings import Recording

__all__ = [
    "Clip",
    "ClipCreate",
    "ClipUpdate",
]


class ClipCreate(BaseModel):
    """Schema for creating a clip."""

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


class Clip(BaseSchema):
    """Schema for Clip objects returned to the user."""

    uuid: UUID
    """The unique identifier of the clip."""

    id: int = Field(..., exclude=True)
    """The database id of the clip."""

    start_time: float
    """The start time of the clip."""

    end_time: float
    """The end time of the clip."""

    recording: Recording
    """Recording information for the clip."""

    features: list[Feature] = Field(default_factory=list)
    """The features associated with the clip."""


class ClipUpdate(BaseModel):
    """Schema for updating a clip."""

    uuid: UUID | None = None
    """The unique identifier of the clip."""
