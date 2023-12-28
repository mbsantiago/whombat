"""Filters for Recording Tags."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "IssuesFilter",
    "RecordingFilter",
    "DatasetFilter",
    "RecordingTagFilter",
]


class DatasetFilter(base.Filter):
    """Filter recordings by the dataset they are in."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Recording,
                models.RecordingTag.recording_id == models.Recording.id,
            )
            .join(
                models.DatasetRecording,
                models.Recording.id == models.DatasetRecording.recording_id,
            )
            .join(
                models.Dataset,
                models.DatasetRecording.dataset_id == models.Dataset.id,
            )
            .where(models.Dataset.uuid == self.eq)
        )


class IssuesFilter(base.Filter):
    """Filter recordings by their status.

    A recording is considered to have issues if it has any notes that
    are issues. This filter can be used to filter recordings that have
    issues or that do not have issues.
    """

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.Recording,
                models.RecordingTag.recording_id == models.Recording.id,
            )
            .join(
                models.RecordingNote,
                models.Recording.id == models.RecordingNote.recording_id,
            )
            .join(
                models.Note,
                models.RecordingNote.note_id == models.Note.id,
            )
            .where(models.Note.is_issue == self.eq)
        )


class TagFilter(base.Filter):
    """Filter recordings by tags.

    This filter can be used to filter recordings that have a certain
    tag.
    """

    key: str | None = None
    value: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.key is None and self.value is None:
            return query

        query = query.join(
            models.Tag,
            models.RecordingTag.tag_id == models.Tag.id,
        )

        conditions = []
        if self.key is not None:
            conditions.append(models.Tag.key == self.key)
        if self.value is not None:
            conditions.append(models.Tag.value == self.value)

        return query.where(*conditions)


class RecordingFilter(base.Filter):
    """Filter recordings by their UUID."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(
            models.Recording,
            models.RecordingTag.recording_id == models.Recording.id,
        ).where(models.Recording.uuid == self.eq)


RecordingTagFilter = base.combine(
    recording=RecordingFilter,
    dataset=DatasetFilter,
    tag=TagFilter,
    issues=IssuesFilter,
)
