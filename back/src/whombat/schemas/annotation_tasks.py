"""Schemas for annotation tasks."""

from uuid import UUID

from pydantic import BaseModel, Field
from soundevent.data import AnnotationState

from whombat.schemas.base import BaseSchema
from whombat.schemas.users import SimpleUser

__all__ = [
    "AnnotationStatusBadge",
    "AnnotationStatusBadgeUpdate",
    "AnnotationTask",
    "AnnotationTaskCreate",
    "AnnotationTaskUpdate",
]


class AnnotationTaskCreate(BaseModel):
    """Schema for creating a new task."""


class AnnotationStatusBadge(BaseSchema):
    """Schema for a task status badge."""

    state: AnnotationState
    """State of the task."""

    user: SimpleUser | None
    """User to whom the status badge refers."""


class AnnotationStatusBadgeUpdate(BaseModel):
    """Schema for updating a task status badge."""

    state: AnnotationState | None = None
    """State of the task."""


class AnnotationTask(BaseSchema):
    """Schema for a task."""

    uuid: UUID
    """UUID of the task."""

    id: int = Field(..., exclude=True)
    """Database ID of the task."""

    status_badges: list[AnnotationStatusBadge]
    """Status badges for the task."""


class AnnotationTaskUpdate(BaseModel):
    """Schema for updating a task."""

    uuid: UUID | None = None
