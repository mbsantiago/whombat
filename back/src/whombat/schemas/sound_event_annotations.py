"""Schemas for Sound Event Annotation related objects."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.notes import Note
from whombat.schemas.sound_events import Geometry, SoundEvent
from whombat.schemas.tags import Tag, TagCreate
from whombat.schemas.users import SimpleUser

__all__ = [
    "SoundEventAnnotation",
    "SoundEventAnnotationCreate",
    "SoundEventAnnotationUpdate",
]


class SoundEventAnnotationTag(BaseModel):
    """Schema for a SoundEventAnnotationTag."""

    tag: Tag
    """Tag attached to this annotation."""

    created_by: SimpleUser | None
    """User who created this annotation."""


class SoundEventAnnotationCreate(BaseModel):
    """Schema for data required to create an SoundEventAnnotation."""

    geometry: Geometry = Field(..., discriminator="type")
    """Geometry of this annotation."""

    tags: list[TagCreate] = Field(default_factory=list)
    """Tags attached to this annotation."""


class SoundEventAnnotation(BaseSchema):
    """Schema for an SoundEventAnnotation."""

    uuid: UUID
    """UUID of this annotation."""

    id: int = Field(..., exclude=True)
    """Database ID of this annotation."""

    created_by: SimpleUser | None
    """User who created this annotation."""

    sound_event: SoundEvent
    """Sound event this annotation is attached to."""

    notes: list[Note] = Field(default_factory=list)
    """Notes attached to this annotation."""

    tags: list[Tag] = Field(default_factory=list)
    """Tags attached to this annotation."""


class SoundEventAnnotationUpdate(BaseSchema):
    """Schema for data required to update an SoundEventAnnotation."""

    geometry: Geometry = Field(..., discriminator="type")
    """Geometry of this annotation."""
