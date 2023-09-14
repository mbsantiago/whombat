"""Filters for Annotation Notes."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "AnnotationFilter",
    "CreatedByFilter",
    "MessageFilter",
    "CreatedAtFilter",
    "IssueFilter",
    "AnnotationNoteFilter",
]


AnnotationFilter = base.integer_filter(models.AnnotationNote.annotation_id)
"""Filter annotation notes by annotation."""

CreatedAtFilter = base.date_filter(models.AnnotationNote.created_at)


class CreatedByFilter(base.Filter):
    """Filter annotation notes by the user who created them."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = query.join(
            models.Note, models.Note.id == models.AnnotationNote.note_id
        )
        return query.where(models.Note.created_by_id == self.eq)


class MessageFilter(base.Filter):
    """Filter annotation notes by message content."""

    eq: str | None = None
    contains: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.contains:
            return query

        query = query.join(
            models.Note, models.Note.id == models.AnnotationNote.note_id
        )

        if self.eq:
            return query.where(models.Note.message == self.eq)

        return query.where(models.Note.message.contains(self.contains))


class IssueFilter(base.Filter):
    """Filter annotation notes by whether they are issues or not."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        query = query.join(
            models.Note, models.Note.id == models.AnnotationNote.note_id
        )

        return query.where(models.Note.is_issue == self.eq)


class TaskFilter(base.Filter):
    """Filter annotation notes by task."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Annotation,
                models.Annotation.id == models.AnnotationNote.annotation_id,
            )
            .join(models.Task, models.Task.id == models.Annotation.task_id)
            .where(models.Task.id == self.eq)
        )


class ProjectFilter(base.Filter):
    """Filter annotation notes by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Annotation,
                models.Annotation.id == models.AnnotationNote.annotation_id,
            )
            .join(models.Task, models.Task.id == models.Annotation.task_id)
            .where(models.Task.project_id == self.eq)
        )


class RecordingFilter(base.Filter):
    """Filter annotation notes by recording."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Annotation,
                models.Annotation.id == models.AnnotationNote.annotation_id,
            )
            .join(models.Task, models.Task.id == models.Annotation.task_id)
            .join(models.Clip, models.Clip.id == models.Task.clip_id)
            .where(models.Clip.recording_id == self.eq)
        )


AnnotationNoteFilter = base.combine(
    annotation=AnnotationFilter,
    created_by=CreatedByFilter,
    message=MessageFilter,
    created_at=CreatedAtFilter,
    is_issue=IssueFilter,
    task=TaskFilter,
    project=ProjectFilter,
    recording=RecordingFilter,
)
