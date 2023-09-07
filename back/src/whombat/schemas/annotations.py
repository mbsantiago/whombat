"""Schemas for Annotation related objects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.notes import Note
from whombat.schemas.sound_events import SoundEvent
from whombat.schemas.tags import Tag
from whombat.schemas.users import SimpleUser

__all__ = [
    "Annotation",
    "AnnotationCreate",
    "AnnotationTagCreate",
]


class AnnotationCreate(BaseSchema):
    """Schema for data required to create an Annotation."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of this annotation."""

    task_id: int
    """ID of the task this annotation belongs to."""

    created_by_id: UUID
    """ID of the user who created this annotation."""

    sound_event_id: int
    """Sound event this annotation is about."""


class Annotation(AnnotationCreate):
    """Schema for an Annotation."""

    id: int
    """Database ID of this annotation."""

    created_by: SimpleUser
    """User who created this annotation."""

    sound_event: SoundEvent

    notes: list[Note] = Field(default_factory=list)
    """Notes attached to this annotation."""

    tags: list[Tag] = Field(default_factory=list)
    """Tags attached to this annotation."""


class AnnotationTagCreate(BaseSchema):
    """Schema for data required to create an AnnotationTag."""

    annotation_id: int
    """ID of the annotation this tag is attached to."""

    tag_id: int
    """ID of the tag attached to this annotation."""

    created_by_id: UUID
    """ID of the user who created this annotation tag."""


class AnnotationNoteCreate(BaseSchema):
    """Schema for data required to create an AnnotationNote."""

    annotation_id: int
    """ID of the annotation this note is attached to."""

    note_id: int
    """ID of the note attached to this annotation."""

    created_by_id: UUID
    """ID of the user who created this annotation note."""


class AnnotationNote(AnnotationNoteCreate):
    """Schema for an AnnotationNote."""

    id: int
    """Database ID of this annotation note."""

    created_by: SimpleUser
    """User who created this annotation note."""

    note: Note
    """Note attached to this annotation."""
