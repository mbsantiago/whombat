"""Filters for Clip Predictions."""

from uuid import UUID

from sqlalchemy import Select, and_, select

from whombat import models
from whombat.filters import base

__all__ = [
    "UUIDFilter",
    "ClipFilter",
    "RecordingFilter",
    "TagFilter",
    "ModelRunFilter",
    "UserRunFilter",
]

UUIDFilter = base.uuid_filter(models.ClipPrediction.uuid)


class ClipFilter(base.Filter):
    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query
        return query.join(
            models.Clip,
            models.Clip.id == models.ClipPrediction.clip_id,
        ).filter(models.Clip.uuid == self.eq)


class RecordingFilter(base.Filter):
    """Filter prediction if it belongs to a specific recording."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return (
            query.join(
                models.Clip,
                models.Clip.id == models.ClipPrediction.clip_id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.Clip.recording_id,
            )
            .filter(models.Recording.uuid == self.eq)
        )


class TagFilter(base.Filter):
    """Filter prediction if it has a specific tag."""

    key: str | None = None
    value: str | None = None
    gt: float | None = None
    lt: float | None = None

    def filter(self, query: Select) -> Select:
        if self.key is None and self.value is None:
            return query

        subquery = select(models.ClipPredictionTag.clip_prediction_id).join(
            models.Tag,
            models.Tag.id == models.ClipPredictionTag.tag_id,
        )

        conditions = []
        if self.key is not None:
            conditions.append(models.Tag.key == self.key)

        if self.value is not None:
            conditions.append(models.Tag.value == self.value)

        if self.gt is not None:
            conditions.append(models.ClipPredictionTag.score > self.gt)

        if self.lt is not None:
            conditions.append(models.ClipPredictionTag.score < self.lt)

        subquery = subquery.filter(and_(*conditions)).distinct()
        return query.filter(models.ClipPrediction.id.in_(subquery))


class SoundEventTagFilter(base.Filter):
    """Filter prediction if it has a specific tag."""

    key: str | None = None
    value: str | None = None
    gt: float | None = None
    lt: float | None = None

    def filter(self, query: Select) -> Select:
        if self.key is None and self.value is None:
            return query

        subquery = (
            select(models.SoundEventPrediction.clip_prediction_id)
            .join(
                models.SoundEventPredictionTag,
                models.SoundEventPredictionTag.sound_event_prediction_id
                == models.SoundEventPrediction.id,
            )
            .join(
                models.Tag,
                models.Tag.id == models.SoundEventPredictionTag.tag_id,
            )
        )

        conditions = []
        if self.key is not None:
            conditions.append(models.Tag.key == self.key)

        if self.value is not None:
            conditions.append(models.Tag.value == self.value)

        if self.gt is not None:
            conditions.append(models.SoundEventPredictionTag.score > self.gt)

        if self.lt is not None:
            conditions.append(models.SoundEventPredictionTag.score < self.lt)

        subquery = subquery.filter(and_(*conditions)).distinct()
        return query.filter(models.ClipPrediction.id.in_(subquery))


class ModelRunFilter(base.Filter):
    """Filter prediction if it belongs to a specific model run."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query
        return (
            query.join(
                models.ModelRunPrediction,
                models.ModelRunPrediction.clip_prediction_id
                == models.ClipPrediction.id,
            )
            .join(
                models.ModelRun,
                models.ModelRun.id == models.ModelRunPrediction.model_run_id,
            )
            .filter(models.ModelRun.uuid == self.eq)
        )


class UserRunFilter(base.Filter):
    """Filter prediction if it belongs to a specific user run."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query
        return (
            query.join(
                models.UserRunPrediction,
                models.UserRunPrediction.clip_prediction_id
                == models.ClipPrediction.id,
            )
            .join(
                models.UserRun,
                models.UserRun.id == models.UserRunPrediction.user_run_id,
            )
            .filter(models.UserRun.uuid == self.eq)
        )


ClipPredictionFilter = base.combine(
    uuid=UUIDFilter,
    clip=ClipFilter,
    recording=RecordingFilter,
    tag=TagFilter,
    model_run=ModelRunFilter,
    user_run=UserRunFilter,
    sound_event_tag=SoundEventTagFilter,
)
