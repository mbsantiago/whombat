"""Schemas for sound events."""

from uuid import UUID, uuid4

from pydantic import Field, computed_field
from soundevent.data.geometries import Geometry, GeometryType

from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.tags import Tag

__all__ = [
    "SoundEventCreate",
    "SoundEvent",
    "SoundEventUpdate",
    "SoundEventFeatureCreate",
]


class SoundEventCreate(BaseSchema):
    """Schema for SoundEvent objects created by the user."""

    uuid: UUID = Field(default_factory=uuid4)
    """The UUID of the sound event."""

    recording_id: int
    """The id of the recording to which the sound event belongs."""

    geometry: Geometry
    """The geometry of the sound event."""

    @computed_field
    @property
    def geometry_type(self) -> GeometryType:
        """Return the type of geometry used to mark the sound event."""
        return self.geometry.type


class SoundEvent(SoundEventCreate):
    """Public schema for handling sound events."""

    id: int
    """The id of the sound event."""

    tags: list[Tag] = Field(default_factory=list)
    """The tags associated with the sound event."""

    features: list[Feature] = Field(default_factory=list)
    """The features associated with the sound event."""


class SoundEventUpdate(BaseSchema):
    """Schema for SoundEvent objects updated by the user."""

    geometry: Geometry
    """The geometry of the sound event."""


class SoundEventFeatureCreate(BaseSchema):
    """Schema for SoundEventFeature objects created by the user."""

    sound_event_id: int
    """The id of the sound event to be associated with the feature."""

    feature_name_id: int
    """The id of the feature name to be associated with the sound event."""

    value: float
    """The value of the feature."""
