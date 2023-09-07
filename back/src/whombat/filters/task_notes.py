"""Filters for Task Notes."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "TaskFilter",
    "UserFilter",
    "MessageFilter",
    "CreatedAtFilter",
    "IssueFilter",
    "TaskNoteFilter",
]


TaskFilter = base.integer_filter(models.TaskNote.task_id)
"""Filter task notes by task."""


class UserFilter(base.Filter):
    """Filter task notes by the user who created them."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = query.join(
            models.Note, models.Note.id == models.TaskNote.note_id
        )
        return query.where(models.Note.created_by_id == self.eq)


class MessageFilter(base.Filter):
    """Filter task notes by message content."""

    eq: str | None = None
    contains: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.contains:
            return query

        query = query.join(
            models.Note, models.Note.id == models.TaskNote.note_id
        )

        if self.eq:
            return query.where(models.Note.message == self.eq)

        return query.where(models.Note.message.contains(self.contains))


CreatedAtFilter = base.date_filter(models.TaskNote.created_at)


class IssueFilter(base.Filter):
    """Filter task notes by whether they are issues or not."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        query = query.join(
            models.Note, models.Note.id == models.TaskNote.note_id
        )

        return query.where(models.Note.is_issue == self.eq)


class ProjectFilter(base.Filter):
    """Filter task notes by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = query.join(
            models.Task, models.Task.id == models.TaskNote.task_id
        )

        return query.where(models.Task.project_id == self.eq)


TaskNoteFilter = base.combine(
    task=TaskFilter,
    project=ProjectFilter,
    user=UserFilter,
    message=MessageFilter,
    created_at=CreatedAtFilter,
    is_issue=IssueFilter,
)
