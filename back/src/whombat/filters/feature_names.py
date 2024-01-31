"""Filters for featuren names."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "FeatureNameFilter",
]


SearchFilter = base.search_filter([models.FeatureName.name])


class ClipFilter(base.Filter):
    """Filter by the clip it is attached to."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter by clip id."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.ClipFeature,
                models.ClipFeature.feature_name_id == models.FeatureName.id,
            )
            .join(
                models.Clip,
                models.Clip.id == models.ClipFeature.clip_id,
            )
            .filter(
                models.Clip.uuid == self.eq,
            )
        )


class SoundEventFilter(base.Filter):
    """Filter by the sound event it is attached to."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter by sound event id."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.SoundEventFeature,
                models.SoundEventFeature.feature_name_id
                == models.FeatureName.id,
            )
            .join(
                models.SoundEvent,
                models.SoundEvent.id
                == models.SoundEventFeature.sound_event_id,
            )
            .filter(
                models.SoundEvent.uuid == self.eq,
            )
        )


class RecordingFilter(base.Filter):
    """Filter by the recording it is attached to."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter by recording id."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.RecordingFeature,
                models.RecordingFeature.feature_name_id
                == models.FeatureName.id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.RecordingFeature.recording_id,
            )
            .filter(
                models.Recording.uuid == self.eq,
            )
        )


FeatureNameFilter = base.combine(
    SearchFilter,
    clip=ClipFilter,
    sound_event=SoundEventFilter,
    recording=RecordingFilter,
)
