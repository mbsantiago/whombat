"""Schemas for annotation tasks."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.models.task import TaskState
from whombat.schemas.base import BaseSchema
from whombat.schemas.clips import Clip
from whombat.schemas.notes import Note
from whombat.schemas.tags import Tag
from whombat.schemas.users import SimpleUser

__all__ = [
    "Task",
    "TaskCreate",
    "TaskStatusBadge",
    "TaskStatusBadgeCreate",
    "TaskTag",
    "TaskTagCreate",
]


class TaskCreate(BaseSchema):
    """Schema for creating a new task."""

    project_id: int
    """ID of the project to which the task belongs."""

    clip_id: int
    """ID of the clip to be annotated."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the task."""


class TaskStatusBadgeCreate(BaseSchema):
    """Schema for creating a new task status badge."""

    task_id: int
    """ID of the task to which the status badge belongs."""

    state: TaskState
    """State of the task."""

    user_id: UUID
    """ID of the user to whom the status badge refers."""


class TaskStatusBadge(TaskStatusBadgeCreate):
    """Schema for a task status badge."""

    id: int
    """Database ID of the status badge."""

    user: SimpleUser
    """User to whom the status badge refers."""


class TaskTagCreate(BaseSchema):
    """Schema for creating a new task tag."""

    task_id: int
    """ID of the task to which the tag belongs.""" ""

    tag_id: int
    """ID of the tag."""

    created_by_id: UUID
    """ID of the user who created the tag."""


class TaskTag(TaskTagCreate):
    """Schema for a task tag."""

    id: int

    tag: Tag
    """Tag object."""

    created_by: SimpleUser
    """User who created the tag."""


class Task(TaskCreate):
    """Schema for a task."""

    id: int
    """Database ID of the task."""

    clip: Clip
    """Clip info for the task."""

    tags: list[TaskTag]
    """Tags provided by the user at the clip level."""

    status_badges: list[TaskStatusBadge]
    """Status badges for the task."""

    notes: list[Note]
    """Notes associated with the task."""
