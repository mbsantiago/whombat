"""Filters for Recording Notes."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "CreatedOnFilter",
    "UserFilter",
    "IssuesFilter",
    "RecordingFilter",
    "DatasetFilter",
    "RecordingNoteFilter",
]


class CreatedOnFilter(base.DateFilter):
    """Filter notes by their creation date."""

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.is_null():
            return query

        query = query.join(
            models.Note,
            models.Note.id == models.RecordingNote.note_id,
        )

        if self.before is not None:
            query = query.filter(models.Note.created_on < self.before)

        if self.after is not None:
            query = query.filter(models.Note.created_on > self.after)

        if self.on is not None:
            query = query.filter(models.Note.created_on == self.on)

        return query


class UserFilter(base.UUIDFilter):
    """Filter notes by their status."""

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.Note, models.Note.id == models.RecordingNote.note_id
            )
            .join(models.User, models.Note.created_by == models.User.id)
            .filter(models.User.id == self.eq)
        )


class IssuesFilter(base.BooleanFilter):
    """Filter notes by their status."""

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return query.join(
            models.Note, models.Note.id == models.RecordingNote.note_id
        ).filter(models.Note.is_issue == self.eq)


class DatasetFilter(base.UUIDFilter):
    """Filter recordings by the dataset they are in."""

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Recording,
                models.Recording.id == models.RecordingNote.recording_id,
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


class RecordingFilter(base.UUIDFilter):
    """Filter recordings by their UUID."""

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(
            models.Recording,
            models.Recording.id == models.RecordingNote.recording_id,
        ).where(models.Recording.uuid == self.eq)


RecordingNoteFilter = base.combine(
    created_by=UserFilter,
    created_on=CreatedOnFilter,
    recording=RecordingFilter,
    dataset=DatasetFilter,
    issues=IssuesFilter,
)
