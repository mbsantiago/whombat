"""Filters for Recordings."""


from sqlalchemy import Select, select

from whombat import schemas
from whombat.database import models
from whombat.filters import base

__all__ = [
    "DurationFilter",
    "SamplerateFilter",
    "ChannelsFilter",
    "HasLatitudeFilter",
    "HasLongitudeFilter",
    "LatitudeFilter",
    "LongitudeFilter",
    "HasDate",
    "DateFilter",
    "HasTime",
    "TimeFilter",
    "SearchFilter",
    "IssuesFilter",
]


DurationFilter = base.float_filter(models.Recording.duration)

SamplerateFilter = base.integer_filter(models.Recording.samplerate)

ChannelsFilter = base.integer_filter(models.Recording.channels)

HasLatitudeFilter = base.null_filter(models.Recording.latitude)

HasLongitudeFilter = base.null_filter(models.Recording.longitude)

LatitudeFilter = base.float_filter(models.Recording.latitude)

LongitudeFilter = base.float_filter(models.Recording.longitude)

HasDate = base.null_filter(models.Recording.date)

DateFilter = base.date_filter(models.Recording.date)

HasTime = base.null_filter(models.Recording.time)

TimeFilter = base.time_filter(models.Recording.time)

SearchFilter = base.search_filter([models.Recording.hash])


class IssuesFilter(base.Filter):
    """Filter recordings by their status.

    A recording is considered to have issues if it has any notes that are
    issues. This filter can be used to filter recordings that have issues or
    that do not have issues.
    """

    has_issues: bool

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        subquery = (
            select(models.RecordingNote.recording_id)
            .join(models.RecordingNote.note)
            .where(models.Note.is_issue == True)  # noqa: E712
        )

        if self.has_issues:
            return query.where(models.Recording.id.in_(subquery))

        return query.where(models.Recording.id.notin_(subquery))


class TagFilter(base.Filter):
    """Filter recordings by tags.

    This filter can be used to filter recordings that have a certain tag.
    """

    tag: schemas.Tag

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        subquery = (
            select(models.RecordingTag.recording_id)
            .join(models.RecordingTag.tag)
            .where(
                models.Tag.key == self.tag.key,
                models.Tag.value == self.tag.value,
            )
        )
        return query.where(models.Recording.id.in_(subquery))
