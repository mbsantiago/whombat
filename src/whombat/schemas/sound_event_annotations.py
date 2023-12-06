"""Schemas for Sound Event Annotation related objects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.notes import Note
from whombat.schemas.sound_events import Geometry, SoundEvent
from whombat.schemas.tags import Tag
from whombat.schemas.users import SimpleUser

__all__ = [
    "SoundEventAnnotation",
    "SoundEventAnnotationCreate",
    "SoundEventAnnotationPostCreate",
    "SoundEventAnnotationTagCreate",
    "SoundEventAnnotationTag",
    "SoundEventAnnotationNoteCreate",
    "SoundEventAnnotationNote",
    "SoundEventAnnotationUpdate",
]


class SoundEventAnnotationNoteCreate(BaseSchema):
    """Schema for data required to create an SoundEventAnnotationNote."""

    annotation_id: int
    """ID of the annotation this note is attached to."""

    note_id: int
    """ID of the note attached to this annotation."""


class SoundEventAnnotationNote(SoundEventAnnotationNoteCreate):
    """Schema for an SoundEventAnnotationNote."""

    id: int
    """Database ID of this annotation note."""

    note: Note
    """Note attached to this annotation."""


class SoundEventAnnotationTagCreate(BaseSchema):
    """Schema for data required to create an SoundEventAnnotationTag."""

    annotation_id: int
    """ID of the annotation this tag is attached to."""

    tag_id: int
    """ID of the tag attached to this annotation."""

    created_by_id: UUID | None
    """ID of the user who created this annotation tag."""


class SoundEventAnnotationTag(SoundEventAnnotationTagCreate):
    """Schema for an SoundEventAnnotationTag."""

    id: int
    """Database ID of this annotation tag."""

    created_by: SimpleUser | None
    """User who created this annotation tag."""

    tag: Tag
    """Tag attached to this annotation."""


class SoundEventAnnotationCreate(BaseSchema):
    """Schema for data required to create an SoundEventAnnotation."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of this annotation."""

    clip_annotation_id: int
    """ID of the clip annotation this annotation belongs to."""

    geometry: Geometry = Field(..., discriminator="type")
    """Geometry of this annotation."""

    tag_ids: list[int] = Field(default_factory=list)
    """IDs of the tags attached to this annotation."""


class SoundEventAnnotationPostCreate(BaseSchema):
    """Schema to create an SoundEventAnnotation from a SoundEvent."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of this annotation."""

    clip_annotation_id: int
    """ID of the clip annotation this annotation belongs to."""

    created_by_id: UUID | None
    """ID of the user who created this annotation."""

    sound_event_id: int
    """Sound event this annotation is about."""


class SoundEventAnnotation(SoundEventAnnotationPostCreate):
    """Schema for an SoundEventAnnotation."""

    id: int
    """Database ID of this annotation."""

    created_by: SimpleUser | None
    """User who created this annotation."""

    sound_event: SoundEvent

    notes: list[Note] = Field(default_factory=list)
    """Notes attached to this annotation."""

    tags: list[SoundEventAnnotationTag] = Field(default_factory=list)
    """Tags attached to this annotation."""


class SoundEventAnnotationUpdate(BaseSchema):
    """Schema for data required to update an SoundEventAnnotation."""

    uuid: UUID | None = None
    """UUID of this annotation."""
