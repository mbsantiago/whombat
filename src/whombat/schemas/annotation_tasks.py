"""Schemas for annotation tasks."""

from uuid import UUID, uuid4

from pydantic import Field
from soundevent.data import AnnotationState

from whombat.schemas.base import BaseSchema
from whombat.schemas.clip_annotations import ClipAnnotation
from whombat.schemas.clips import Clip
from whombat.schemas.users import SimpleUser

__all__ = [
    "AnnotationStatusBadge",
    "AnnotationStatusBadgeCreate",
    "AnnotationStatusBadgeUpdate",
    "AnnotationTask",
    "AnnotationTaskCreate",
    "AnnotationTaskUpdate",
]


class AnnotationTaskCreate(BaseSchema):
    """Schema for creating a new task."""

    annotation_project_id: int
    """ID of the project to which the task belongs."""

    clip_id: int
    """ID of the clip to be annotated."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the task."""


class AnnotationStatusBadgeCreate(BaseSchema):
    """Schema for creating a new task status badge."""

    annotation_task_id: int
    """ID of the task to which the status badge belongs."""

    state: AnnotationState
    """State of the task."""

    user_id: UUID | None
    """ID of the user to whom the status badge refers."""


class AnnotationStatusBadge(AnnotationStatusBadgeCreate):
    """Schema for a task status badge."""

    user: SimpleUser | None
    """User to whom the status badge refers."""


class AnnotationStatusBadgeUpdate(BaseSchema):
    """Schema for updating a task status badge."""

    state: AnnotationState | None = None
    """State of the task."""


class AnnotationTask(AnnotationTaskCreate):
    """Schema for a task."""

    id: int
    """Database ID of the task."""

    clip: Clip
    """Clip info for the task."""

    status_badges: list[AnnotationStatusBadge]
    """Status badges for the task."""

    clip_annotation: ClipAnnotation


class AnnotationTaskUpdate(BaseSchema):
    """Schema for updating a task."""

    uuid: UUID | None = None
