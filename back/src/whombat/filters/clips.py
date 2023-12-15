"""Filters for Clips."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "UUIDFilter",
    "RecordingFilter",
    "StartTimeFilter",
    "EndTimeFilter",
    "ClipFilter",
]


UUIDFilter = base.uuid_filter(models.Clip.uuid)
"""Filter a query by a UUID."""


class RecordingFilter(base.Filter):
    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query
        return query.join(
            models.Recording,
            models.Recording.id == models.Clip.recording_id,
        ).filter(models.Recording.uuid == self.eq)


StartTimeFilter = base.float_filter(models.Clip.start_time)
"""Filter a query by a start time."""


EndTimeFilter = base.float_filter(models.Clip.end_time)
"""Filter a query by an end time."""


class FeatureFilter(base.Filter):
    name: str | None = None
    gt: float | None = None
    lt: float | None = None

    def filter(self, query: Select) -> Select:
        if self.name is None:
            return query

        query = query.join(
            models.ClipFeature,
            models.ClipFeature.clip_id == models.Clip.id,
        ).join(
            models.FeatureName,
            models.FeatureName.id == models.ClipFeature.feature_name_id,
        )

        conditions = [models.FeatureName.name == self.name]
        if self.gt is not None:
            conditions.append(models.ClipFeature.value > self.gt)
        if self.lt is not None:
            conditions.append(models.ClipFeature.value < self.lt)

        return query.filter(*conditions)


class DatasetFilter(base.Filter):
    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return (
            query.join(
                models.Recording,
                models.Recording.id == models.Clip.recording_id,
            )
            .join(
                models.DatasetRecording,
                models.DatasetRecording.recording_id == models.Recording.id,
            )
            .join(
                models.Dataset,
                models.Dataset.id == models.DatasetRecording.dataset_id,
            )
            .filter(models.Dataset.uuid == self.eq)
        )


ClipFilter = base.combine(
    uuid=UUIDFilter,
    recording=RecordingFilter,
    start_time=StartTimeFilter,
    end_time=EndTimeFilter,
    feature=FeatureFilter,
    dataset=DatasetFilter,
)
