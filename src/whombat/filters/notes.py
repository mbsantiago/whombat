"""Filters for Notes."""
from sqlalchemy import Select

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

CreatedAtFilter = base.date_filter(models.Note.created_on)

IssueFilter = base.boolean_filter(models.Note.is_issue)
"""Filter notes by whether they are issues or not."""

UUIDFilter = base.uuid_filter(models.Note.uuid)
"""Filter notes by their UUID."""


class ProjectFilter(base.Filter):
    """Get notes created within a specific annotation project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = (
            query.join(
                models.SoundEventAnnotationNote,
                models.SoundEventAnnotationNote.note_id == models.Note.id,
            )
            .join(
                models.SoundEventAnnotation,
                models.SoundEventAnnotation.id
                == models.SoundEventAnnotationNote.sound_event_annotation_id,
            )
            .join(
                models.ClipAnnotation,
                models.ClipAnnotation.id
                == models.SoundEventAnnotation.clip_annotation_id,
            )
            .join(
                models.ClipAnnotationNote,
                models.ClipAnnotationNote.note_id == models.Note.id,
            )
            .join(
                models.AnnotationTask,
                models.AnnotationTask.clip_id == models.ClipAnnotation.clip_id,
            )
        )

        return query.where(models.AnnotationTask.annotation_project_id == self.eq)


NoteFilter = base.combine(
    message=MessageFilter,
    created_by=CreatedByFilter,
    created_on=CreatedAtFilter,
    is_issue=IssueFilter,
    uuid=UUIDFilter,
    project=ProjectFilter,
)
