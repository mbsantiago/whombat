"""Filters for Notes."""
from sqlalchemy import Select
from sqlalchemy.orm import aliased

from whombat import models
from whombat.filters import base

__all__ = [
    "MessageFilter",
    "CreatedByFilter",
    "CreatedAtFilter",
    "IssueFilter",
    "UUIDFilter",
    "NoteFilter",
]


MessageFilter = base.string_filter(models.Note.message)
"""Filter note by message content."""

CreatedByFilter = base.uuid_filter(models.Note.created_by_id)
"""Filter notes by the user who created them."""

CreatedAtFilter = base.date_filter(models.Note.created_at)

IssueFilter = base.boolean_filter(models.Note.is_issue)
"""Filter notes by whether they are issues or not."""

UUIDFilter = base.uuid_filter(models.Note.uuid)
"""Filter notes by their UUID."""


class ProjectFilter(base.Filter):
    """Get notes created within a specific annotation project."""

    eq: int | None = None
    isin: list[int] | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.isin:
            return query

        AnnotationTask = aliased(models.Task)
        NoteTask = aliased(models.Task)

        query = (
            query.join(
                models.AnnotationNote,
                models.AnnotationNote.note_id == models.Note.id,
            )
            .join(
                models.Annotation,
                models.Annotation.id == models.AnnotationNote.annotation_id,
            )
            .join(
                AnnotationTask,
                AnnotationTask.id == models.Annotation.task_id,
            )
            .join(
                models.TaskNote,
                models.TaskNote.note_id == models.Note.id,
            )
            .join(
                NoteTask,
                NoteTask.id == models.TaskNote.task_id,
            )
        )

        if self.eq:
            return query.where(
                (AnnotationTask.project_id == self.eq)
                | (NoteTask.project_id == self.eq)
            )

        if not self.isin:
            return query

        return query.where(
            (AnnotationTask.project_id.in_(self.isin))
            | (NoteTask.project_id.in_(self.isin))
        )


NoteFilter = base.combine(
    message=MessageFilter,
    created_by=CreatedByFilter,
    created_at=CreatedAtFilter,
    is_issue=IssueFilter,
    uuid=UUIDFilter,
    project=ProjectFilter,
)
