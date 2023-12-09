"""Schemas for sound events."""

from uuid import UUID

from pydantic import BaseModel, Field, computed_field
from soundevent.data.geometries import Geometry, GeometryType

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature

__all__ = [
    "SoundEventCreate",
    "SoundEvent",
    "SoundEventUpdate",
]


class SoundEventCreate(BaseModel):
    """Schema for SoundEvent objects created by the user."""

    geometry: Geometry = Field(..., discriminator="type")
    """The geometry of the sound event."""

    @computed_field
    @property
    def geometry_type(self) -> GeometryType:
        """Return the type of geometry used to mark the sound event."""
        return self.geometry.type


class SoundEvent(BaseSchema):
    """Public schema for handling sound events."""

    uuid: UUID
    """The uuid of the sound event."""

    id: int = Field(..., exclude=True)
    """The id of the sound event."""

    geometry: Geometry = Field(..., discriminator="type")

    geometry_type: GeometryType

    features: list[Feature] = Field(default_factory=list)
    """The features associated with the sound event."""


class SoundEventUpdate(BaseSchema):
    """Schema for SoundEvent objects updated by the user."""

    geometry: Geometry = Field(..., discriminator="type")
    """The geometry of the sound event."""
