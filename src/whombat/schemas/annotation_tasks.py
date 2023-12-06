"""Schemas for annotation tasks."""

from uuid import UUID, uuid4

from pydantic import Field

from soundevent.data import AnnotationState
from whombat.schemas.base import BaseSchema
from whombat.schemas.clip_annotations import ClipAnnotation
from whombat.schemas.clips import Clip
from whombat.schemas.users import SimpleUser

__all__ = [
    "AnnotationTask",
    "AnnotationTaskCreate",
    "AnnotationTaskStatusBadge",
    "AnnotationTaskStatusBadgeCreate",
]


class AnnotationTaskCreate(BaseSchema):
    """Schema for creating a new task."""

    annotation_project_id: int
    """ID of the project to which the task belongs."""

    clip_id: int
    """ID of the clip to be annotated."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the task."""


class AnnotationTaskStatusBadgeCreate(BaseSchema):
    """Schema for creating a new task status badge."""

    task_id: int
    """ID of the task to which the status badge belongs."""

    state: AnnotationState
    """State of the task."""

    user_id: UUID | None
    """ID of the user to whom the status badge refers."""


class AnnotationTaskStatusBadge(AnnotationTaskStatusBadgeCreate):
    """Schema for a task status badge."""

    id: int
    """Database ID of the status badge."""

    user: SimpleUser | None
    """User to whom the status badge refers."""


class AnnotationTask(AnnotationTaskCreate):
    """Schema for a task."""

    id: int
    """Database ID of the task."""

    clip: Clip
    """Clip info for the task."""

    status_badges: list[AnnotationTaskStatusBadge]
    """Status badges for the task."""

    clip_annotation: ClipAnnotation
