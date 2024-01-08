"""Schemas for Clip Annotations related objects."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.clips import Clip
from whombat.schemas.notes import Note
from whombat.schemas.sound_event_annotations import SoundEventAnnotation
from whombat.schemas.tags import Tag
from whombat.schemas.users import SimpleUser

__all__ = [
    "ClipAnnotation",
    "ClipAnnotationCreate",
    "ClipAnnotationTag",
]


class ClipAnnotationTag(BaseSchema):
    """Schema for an ClipAnnotationTag."""

    created_by: SimpleUser | None
    """User who created this annotation tag."""

    tag: Tag
    """Tag attached to this annotation."""


class ClipAnnotationCreate(BaseModel):
    """Schema for data required to create an ClipAnnotation."""

    tags: list[Tag] = Field(default_factory=list)


class ClipAnnotation(BaseSchema):
    """Schema for an ClipAnnotation."""

    uuid: UUID

    id: int = Field(..., exclude=True)
    """Database ID of this annotation."""

    clip: Clip
    """Clip this annotation is attached to."""

    notes: list[Note] = Field(
        default_factory=list,
        description="Notes attached to this annotation.",
    )

    tags: list[Tag] = Field(
        default_factory=list,
        description="Tags attached to this annotation.",
        alias_priority=10000,
    )

    sound_events: list[SoundEventAnnotation] = Field(
        default_factory=list,
        description="Annotated sound events attached to this clip.",
    )


class ClipAnnotationUpdate(BaseSchema):
    """Schema for data required to update an ClipAnnotation."""

    uuid: UUID | None = None
    """UUID of the annotation."""
