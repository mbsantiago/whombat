"""Filters for Recordings."""

from uuid import UUID

from sqlalchemy import Select, select

from whombat import models
from whombat.filters import base

__all__ = [
    "ChannelsFilter",
    "DatasetFilter",
    "DateFilter",
    "DurationFilter",
    "TimeExpansionFilter",
    "IssuesFilter",
    "LatitudeFilter",
    "LongitudeFilter",
    "RecordingFilter",
    "RecordingFilter",
    "SamplerateFilter",
    "SearchFilter",
    "TagFilter",
    "TimeFilter",
]

UUIDFilter = base.uuid_filter(models.Recording.uuid)

DurationFilter = base.float_filter(models.Recording.duration)
"""Filter recordings by duration."""

SamplerateFilter = base.integer_filter(models.Recording.samplerate)
"""Filter recordings by samplerate."""

ChannelsFilter = base.integer_filter(models.Recording.channels)
"""Filter recordings by channels."""

LatitudeFilter = base.optional_float_filter(models.Recording.latitude)
"""Filter recordings by latitude."""

LongitudeFilter = base.optional_float_filter(models.Recording.longitude)
"""Filter recordings by longitude."""

DateFilter = base.optional_date_filter(models.Recording.date)
"""Filter recordings by date."""

TimeFilter = base.optional_time_filter(models.Recording.time)
"""Filter recordings by time."""

TimeExpansionFilter = base.float_filter(models.Recording.time_expansion)
"""Filter recordings by time expansion."""

HashFilter = base.string_filter(models.Recording.hash)
"""Filter recordings by hash."""

SearchFilter = base.search_filter(
    [
        models.Recording.path,
    ]
)


class DatasetFilter(base.Filter):
    """Filter recordings by the dataset they are in."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
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

        subquery = (
            select(models.RecordingNote.recording_id)
            .join(models.RecordingNote.note)
            .where(models.Note.is_issue == True)  # noqa: E712
        )

        if self.eq:
            return query.where(models.Recording.id.in_(subquery))

        return query.where(models.Recording.id.notin_(subquery))


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
            models.RecordingTag,
            models.Recording.id == models.RecordingTag.recording_id,
        ).join(models.Tag, models.RecordingTag.tag_id == models.Tag.id)

        conditions = []
        if self.key is not None:
            conditions.append(models.Tag.key == self.key)
        if self.value is not None:
            conditions.append(models.Tag.value == self.value)

        return query.where(*conditions)


RecordingFilter = base.combine(
    SearchFilter,
    tag=TagFilter,
    dataset=DatasetFilter,
    duration=DurationFilter,
    samplerate=SamplerateFilter,
    channels=ChannelsFilter,
    latitude=LatitudeFilter,
    longitude=LongitudeFilter,
    date=DateFilter,
    time=TimeFilter,
    has_issues=IssuesFilter,
    time_expansion=TimeExpansionFilter,
)
