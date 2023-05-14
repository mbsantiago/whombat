"""Schemas for sound events."""

from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from whombat.geometries import Geometry, GeometryType
from whombat.schemas.features import Feature
from whombat.schemas.tags import Tag

__all__ = [
    "SoundEvent",
]


class SoundEvent(BaseModel):
    """Public schema for handling sound events."""

    uuid: UUID = Field(default_factory=uuid4)
    """The UUID of the sound event."""

    geometry_type: GeometryType
    """The type of geometry used to mark the sound event."""

    geometry: Geometry
    """The geometry of the sound event."""

    tags: list[Tag] = Field(default_factory=list)
    """The tags associated with the sound event."""

    features: list[Feature] = Field(default_factory=list)
    """The features associated with the sound event."""
