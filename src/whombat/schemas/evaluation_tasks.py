"""Schemas for evaluation tasks."""

from whombat.schemas.base import BaseSchema
from whombat.schemas.tasks import Task

__all__ = []


class EvaluationTaskCreate(BaseSchema):
    """Schema for creating a new evaluation task."""

    evaluation_set_id: int
    """ID of the evaluation set to which the task belongs."""

    task_id: int
    """ID of the task added to the evaluation set."""


class EvaluationTask(EvaluationTaskCreate):
    """Schema for a task."""

    id: int
    """Database ID of the task."""

    task: Task
    """Clip info for the task."""
