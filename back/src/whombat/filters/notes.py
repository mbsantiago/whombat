"""Filters for Notes."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "MessageFilter",
    "CreatedByFilter",
    "CreatedAtFilter",
    "IssueFilter",
    "NoteFilter",
]


MessageFilter = base.string_filter(models.Note.message)
"""Filter note by message content."""

CreatedByFilter = base.uuid_filter(models.Note.created_by_id)
"""Filter notes by the user who created them."""

CreatedAtFilter = base.date_filter(models.Note.created_on)

IssueFilter = base.boolean_filter(models.Note.is_issue)
"""Filter notes by whether they are issues or not."""


class AnnotationProjectFilter(base.Filter):
    """Get notes created within a specific annotation project."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
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
            .join(
                models.AnnotationProject,
                models.AnnotationProject.id
                == models.AnnotationTask.annotation_project_id,
            )
            .where(
                models.AnnotationProject.uuid == self.eq,
            )
        )


class RecordingFilter(base.Filter):
    """Get notes created within a specific recording."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.RecordingNote,
                models.RecordingNote.note_id == models.Note.id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.RecordingNote.recording_id,
            )
            .where(
                models.Recording.uuid == self.eq,
            )
        )


class SoundEventAnnotationFilter(base.Filter):
    """Get notes created within a specific sound event annotation."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.SoundEventAnnotationNote,
                models.SoundEventAnnotationNote.note_id == models.Note.id,
            )
            .join(
                models.SoundEventAnnotation,
                models.SoundEventAnnotation.id
                == models.SoundEventAnnotationNote.sound_event_annotation_id,
            )
            .where(
                models.SoundEventAnnotation.uuid == self.eq,
            )
        )


class ClipAnnotationFilter(base.Filter):
    """Get notes created within a specific clip annotation."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
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
            .where(
                models.ClipAnnotation.uuid == self.eq,
            )
        )


class DatasetFilter(base.Filter):
    """Get notes of recordings within a specific dataset."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Apply the filter.

        Will filter the query to only include notes of recordings within the
        specified dataset.
        """
        if self.eq is None:
            return query

        return (
            query.join(
                models.RecordingNote,
                models.RecordingNote.note_id == models.Note.id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.RecordingNote.recording_id,
            )
            .join(
                models.DatasetRecording,
                models.DatasetRecording.recording_id == models.Recording.id,
            )
            .join(
                models.Dataset,
                models.Dataset.id == models.DatasetRecording.dataset_id,
            )
            .where(models.Dataset.uuid == self.eq)
        )


NoteFilter = base.combine(
    message=MessageFilter,
    created_by=CreatedByFilter,
    created_on=CreatedAtFilter,
    is_issue=IssueFilter,
    annotation_project=AnnotationProjectFilter,
    recording=RecordingFilter,
    sound_event_annotation=SoundEventAnnotationFilter,
    clip_annotation=ClipAnnotationFilter,
    dataset=DatasetFilter,
)
