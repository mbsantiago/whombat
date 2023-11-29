"""Filters for Sound Events."""

from whombat import models
from whombat.filters import base

__all__ = [
    "SoundEventFilter",
    "RecordingFilter",
    "GeometryTypeFilter",
    "CreatedAtFilter",
    "IDFilter",
    "UUIDFilter",
]


RecordingFilter = base.integer_filter(models.SoundEvent.recording_id)
"""Filter by recording ID."""


GeometryTypeFilter = base.string_filter(models.SoundEvent.geometry_type)
"""Filter by geometry type."""


CreatedAtFilter = base.date_filter(models.SoundEvent.created_at)
"""Filter by created at."""


IDFilter = base.integer_filter(models.SoundEvent.id)
"""Filter by ID."""


UUIDFilter = base.uuid_filter(models.SoundEvent.uuid)
"""Filter by UUID."""


SoundEventFilter = base.combine(
    recording=RecordingFilter,
    geometry_type=GeometryTypeFilter,
    created_at=CreatedAtFilter,
    id=IDFilter,
    uuid=UUIDFilter,
)
