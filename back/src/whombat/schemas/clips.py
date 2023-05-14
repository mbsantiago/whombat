"""Schemas for handling clips."""

from uuid import UUID, uuid4

from pydantic import BaseModel, Field, root_validator

from whombat.schemas.features import Feature
from whombat.schemas.tags import Tag
from whombat.schemas.recordings import Recording


__all__ = [
    "Clip",
    "ClipCreate",
]


class Clip(BaseModel):
    """Schema for Clip objects returned to the user."""

    recording: Recording
    start_time: float
    end_time: float

    uuid: UUID = uuid4()
    tags: list[Tag] = Field(default_factory=list)
    features: list[Feature] = Field(default_factory=list)

    class Config:
        """Pydantic configuration."""

        orm_mode = True

    @root_validator
    def validate_times(cls, values):
        """Validate that start_time < end_time."""
        if values["start_time"] > values["end_time"]:
            raise ValueError("start_time must be less than end_time")
        return values


class ClipCreate(BaseModel):
    """Schema for creating a clip."""

    recording_hash: str
    start_time: float
    end_time: float
