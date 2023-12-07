"""Schemas for Clip Annotations related objects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.clips import Clip
from whombat.schemas.notes import Note
from whombat.schemas.sound_event_annotations import SoundEventAnnotation
from whombat.schemas.tags import Tag
from whombat.schemas.users import SimpleUser

__all__ = [
    "ClipAnnotation",
    "ClipAnnotationCreate",
    "ClipAnnotationNote",
    "ClipAnnotationNoteCreate",
    "ClipAnnotationTag",
    "ClipAnnotationTagCreate",
]


class ClipAnnotationNoteCreate(BaseSchema):
    """Schema for data required to create an ClipAnnotationNote."""

    clip_annotation_id: int
    """ID of the annotation this note is attached to."""

    note_id: int
    """ID of the note attached to this annotation."""


class ClipAnnotationNote(ClipAnnotationNoteCreate):
    """Schema for an ClipAnnotationNote."""

    id: int
    """Database ID of this annotation note."""

    note: Note
    """Note attached to this annotation."""


class ClipAnnotationTagCreate(BaseSchema):
    """Schema for data required to create an ClipAnnotationTag."""

    clip_annotation_id: int
    """ID of the annotation this tag is attached to."""

    tag_id: int
    """ID of the tag attached to this annotation."""

    created_by_id: UUID | None = None
    """ID of the user who created this annotation tag."""


class ClipAnnotationTag(ClipAnnotationTagCreate):
    """Schema for an ClipAnnotationTag."""

    id: int
    """Database ID of this annotation tag."""

    created_by: SimpleUser | None
    """User who created this annotation tag."""

    tag: Tag
    """Tag attached to this annotation."""


class ClipAnnotationCreate(BaseSchema):
    """Schema for data required to create an ClipAnnotation."""

    uuid: UUID = Field(
        default_factory=uuid4,
        description="UUID of the annotation.",
    )

    clip_id: int
    """ID of the clip this annotation is attached to."""


class ClipAnnotation(ClipAnnotationCreate):
    """Schema for an ClipAnnotation."""

    id: int
    """Database ID of this annotation."""

    clip: Clip
    """Clip this annotation is attached to."""

    notes: list[Note] = Field(
        default_factory=list,
        description="Notes attached to this annotation.",
    )

    tags: list[ClipAnnotationTag] = Field(
        default_factory=list,
        description="Tags attached to this annotation.",
    )

    sound_events: list[SoundEventAnnotation] = Field(
        default_factory=list,
        description="Annotated sound events attached to this clip.",
    )


class ClipAnnotationUpdate(BaseSchema):
    """Schema for data required to update an ClipAnnotation."""

    uuid: UUID | None = None
    """UUID of the annotation."""
