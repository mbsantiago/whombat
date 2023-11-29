"""Filters for Recording Notes."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "RecordingFilter",
    "UserFilter",
    "MessageFilter",
    "CreatedAtFilter",
    "IssueFilter",
    "RecordingNoteFilter",
]


RecordingFilter = base.integer_filter(models.RecordingNote.recording_id)
"""Filter recording notes by recording."""


class UserFilter(base.Filter):
    """Filter recording notes by the user who created them."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = query.join(
            models.Note, models.Note.id == models.RecordingNote.note_id
        )
        return query.where(models.Note.created_by_id == self.eq)


class MessageFilter(base.Filter):
    """Filter recording notes by message content."""

    eq: str | None = None
    contains: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.contains:
            return query

        query = query.join(
            models.Note, models.Note.id == models.RecordingNote.note_id
        )

        if self.eq:
            return query.where(models.Note.message == self.eq)

        return query.where(models.Note.message.contains(self.contains))


CreatedAtFilter = base.date_filter(models.RecordingNote.created_at)


class IssueFilter(base.Filter):
    """Filter recording notes by whether they are issues or not."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        query = query.join(
            models.Note, models.Note.id == models.RecordingNote.note_id
        )

        return query.where(models.Note.is_issue == self.eq)


RecordingNoteFilter = base.combine(
    recording=RecordingFilter,
    user=UserFilter,
    message=MessageFilter,
    created_at=CreatedAtFilter,
    is_issue=IssueFilter,
)
