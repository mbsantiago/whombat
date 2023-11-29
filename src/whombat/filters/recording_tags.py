"""Filters for Recording Tags."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "RecordingFilter",
    "TagFilter",
    "KeyFilter",
    "ValueFilter",
    "SearchFilter",
    "DatasetFilter",
    "CreatedAtFilter",
    "RecordingTagFilter",
]

TagFilter = base.integer_filter(models.RecordingTag.tag_id)
"""Filter recording tag by tag."""


RecordingFilter = base.integer_filter(models.RecordingTag.recording_id)
"""Filter recording tag by recording."""


CreatedAtFilter = base.date_filter(models.RecordingTag.created_at)
"""Filter recording tags by creation date."""


class KeyFilter(base.Filter):
    """Filter recording tags by key."""

    eq: str | None = None
    has: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.has:
            return query

        query = query.join(
            models.Tag, models.Tag.id == models.RecordingTag.tag_id
        )

        if self.eq:
            query = query.where(models.Tag.key == self.eq)

        if self.has:
            query = query.where(models.Tag.key.contains(self.has))

        return query


class ValueFilter(base.Filter):
    """Filter recording tags by value."""

    eq: str | None = None
    has: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.has:
            return query

        query = query.join(
            models.Tag, models.Tag.id == models.RecordingTag.tag_id
        )

        if self.eq:
            query = query.where(models.Tag.value == self.eq)

        if self.has:
            query = query.where(models.Tag.value.contains(self.has))

        return query


class SearchFilter(base.Filter):
    """Filter recording tags by key or value."""

    search: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.search:
            return query

        return query.join(
            models.Tag, models.Tag.id == models.RecordingTag.tag_id
        ).where(
            models.Tag.key.contains(self.search)
            | models.Tag.value.contains(self.search)
        )


class DatasetFilter(base.Filter):
    """Filter recording tags by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Recording,
                models.Recording.id == models.RecordingTag.recording_id,
            )
            .join(
                models.DatasetRecording,
                models.DatasetRecording.recording_id == models.Recording.id,
            )
            .where(models.DatasetRecording.dataset_id == self.eq)
        )


RecordingTagFilter = base.combine(
    SearchFilter,
    tag=TagFilter,
    value=ValueFilter,
    key=KeyFilter,
    recording=RecordingFilter,
    dataset=DatasetFilter,
    created_at=CreatedAtFilter,
)
