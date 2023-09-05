"""Filters for Clips."""

from whombat import models
from whombat.filters import base

__all__ = [
    "UUIDFilter",
    "RecordingIDFilter",
    "StartTimeFilter",
    "EndTimeFilter",
    "ClipFilter",
]


UUIDFilter = base.uuid_filter(models.Clip.uuid)
"""Filter a query by a UUID."""


RecordingIDFilter = base.integer_filter(models.Clip.recording_id)
"""Filter a query by a recording id."""


StartTimeFilter = base.float_filter(models.Clip.start_time)
"""Filter a query by a start time."""


EndTimeFilter = base.float_filter(models.Clip.end_time)
"""Filter a query by an end time."""


ClipFilter = base.combine(
    uuid=UUIDFilter,
    recording_id=RecordingIDFilter,
    start_time=StartTimeFilter,
    end_time=EndTimeFilter,
)
