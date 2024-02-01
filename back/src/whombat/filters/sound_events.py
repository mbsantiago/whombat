"""Filters for Sound Events."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "SoundEventFilter",
    "RecordingFilter",
    "GeometryTypeFilter",
    "CreatedOnFilter",
    "UUIDFilter",
]


class RecordingFilter(base.Filter):
    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter by recording ID."""
        if self.eq is None:
            return query

        return query.join(
            models.Recording,
            models.SoundEvent.recording_id == models.Recording.id,
        ).filter(models.Recording.uuid == self.eq)


GeometryTypeFilter = base.string_filter(models.SoundEvent.geometry_type)
"""Filter by geometry type."""


CreatedOnFilter = base.date_filter(models.SoundEvent.created_on)
"""Filter by created at."""


UUIDFilter = base.uuid_filter(models.SoundEvent.uuid)
"""Filter by UUID."""


class FeatureFilter(base.Filter):
    name: str | None = None
    lt: float | None = None
    gt: float | None = None

    def filter(self, query: Select) -> Select:
        """Filter by feature."""
        if self.name is None:
            return query

        query = query.join(
            models.SoundEventFeature,
            models.SoundEvent.id == models.SoundEventFeature.sound_event_id,
        ).join(
            models.FeatureName,
            models.SoundEventFeature.feature_name_id == models.FeatureName.id,
        )

        conditions = [models.FeatureName.name == self.name]
        if self.lt is not None:
            conditions.append(models.SoundEventFeature.value < self.lt)

        if self.gt is not None:
            conditions.append(models.SoundEventFeature.value > self.gt)

        return query.filter(*conditions)


SoundEventFilter = base.combine(
    recording=RecordingFilter,
    geometry_type=GeometryTypeFilter,
    created_on=CreatedOnFilter,
    uuid=UUIDFilter,
    feature=FeatureFilter,
)
