"""Filters for Task Notes."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "ClipAnnotationFilter",
    "UserFilter",
    "MessageFilter",
    "CreatedOnFilter",
    "IssueFilter",
    "TaskNoteFilter",
]


ClipAnnotationFilter = base.integer_filter(
    models.ClipAnnotationNote.clip_annotation_id
)
"""Filter notes by the clip annotation to which they belong."""


class UserFilter(base.Filter):
    """Filter notes by the user who created them."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = query.join(
            models.Note,
            models.Note.id == models.ClipAnnotationNote.note_id,
        )
        return query.where(models.Note.created_by_id == self.eq)


class MessageFilter(base.Filter):
    """Filter notes by message content."""

    eq: str | None = None
    contains: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.contains:
            return query

        query = query.join(
            models.Note,
            models.Note.id == models.ClipAnnotationNote.note_id,
        )

        if self.eq:
            return query.where(models.Note.message == self.eq)

        return query.where(models.Note.message.contains(self.contains))


CreatedOnFilter = base.date_filter(models.ClipAnnotationNote.created_on)


class IssueFilter(base.Filter):
    """Filter notes by whether they are issues or not."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        query = query.join(
            models.Note,
            models.Note.id == models.ClipAnnotationNote.note_id,
        )

        return query.where(models.Note.is_issue == self.eq)


class ProjectFilter(base.Filter):
    """Filter notes by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = query.join(
            models.ClipAnnotation,
            models.ClipAnnotation.id
            == models.ClipAnnotationNote.clip_annotation_id,
        ).join(
            models.AnnotationTask,
            models.AnnotationTask.clip_annotation_id
            == models.ClipAnnotation.id,
        )

        return query.where(
            models.AnnotationTask.annotation_project_id == self.eq
        )


TaskNoteFilter = base.combine(
    task=ClipAnnotationFilter,
    project=ProjectFilter,
    user=UserFilter,
    message=MessageFilter,
    created_on=CreatedOnFilter,
    is_issue=IssueFilter,
)
