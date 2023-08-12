"""Schemas for sound events."""

from uuid import UUID, uuid4

from pydantic import Field
from soundevent.data.geometries import Geometry, GeometryType

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.tags import Tag

__all__ = [
    "SoundEvent",
]


class SoundEventCreate(BaseSchema):
    """Schema for SoundEvent objects created by the user."""

    uuid: UUID = Field(default_factory=uuid4)
    """The UUID of the sound event."""

    recording_id: int
    """The id of the recording to which the sound event belongs."""

    geometry: Geometry
    """The geometry of the sound event."""

    tags: list[Tag] = Field(default_factory=list)
    """The tags associated with the sound event."""

    features: list[Feature] = Field(default_factory=list)
    """The features associated with the sound event."""


class SoundEvent(SoundEventCreate):
    """Public schema for handling sound events."""

    id: int | None = None
    """The id of the sound event."""

    geometry_type: GeometryType
    """The type of geometry used to mark the sound event."""
