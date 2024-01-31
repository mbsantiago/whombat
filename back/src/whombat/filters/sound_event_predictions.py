"""Filters for Predictions."""

from uuid import UUID

from sqlalchemy import Select, and_

from whombat import models
from whombat.filters import base

__all__ = [
    "SoundEventPredictionFilter",
    "RecordingFilter",
    "SoundEventFilter",
    "ClipPredictionFilter",
    "TagFilter",
]


class ClipPredictionFilter(base.Filter):
    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return query.join(
            models.ClipPrediction,
            models.ClipPrediction.id
            == models.SoundEventPrediction.clip_prediction_id,
        ).filter(models.ClipPrediction.uuid == self.eq)


class SoundEventFilter(base.Filter):
    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return query.join(
            models.SoundEvent,
            models.SoundEvent.id == models.SoundEventPrediction.sound_event_id,
        ).filter(models.SoundEvent.uuid == self.eq)


class RecordingFilter(base.Filter):
    """Filter for predictions by dataset."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.ClipPrediction,
                models.ClipPrediction.id
                == models.SoundEventPrediction.clip_prediction_id,
            )
            .join(
                models.Clip,
                models.Clip.id == models.ClipPrediction.clip_id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.Clip.recording_id,
            )
            .where(models.Recording.uuid == self.eq)
        )


class TagFilter(base.Filter):
    """Filter for predictions by tag."""

    key: str | None = None
    value: str | None = None
    gt: float | None = None
    lt: float | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.key is None and self.value is None:
            return query

        query = query.join(
            models.SoundEventPredictionTag,
            models.SoundEventPredictionTag.sound_event_prediction_id
            == models.SoundEventPrediction.id,
        ).join(
            models.Tag, models.Tag.id == models.SoundEventPredictionTag.tag_id
        )

        conditions = []
        if self.key is not None:
            conditions.append(models.Tag.key == self.key)

        if self.value is not None:
            conditions.append(models.Tag.value == self.value)

        if self.gt is not None:
            conditions.append(models.SoundEventPredictionTag.score >= self.gt)

        if self.lt is not None:
            conditions.append(models.SoundEventPredictionTag.score <= self.gt)

        return query.join(models.SoundEventPredictionTag).where(
            and_(*conditions)
        )


class ModelRunFilter(base.Filter):
    """Filter for predictions by model run."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.ClipPrediction,
                models.ClipPrediction.id
                == models.SoundEventPrediction.clip_prediction_id,
            )
            .join(
                models.ModelRunPrediction,
                models.ModelRunPrediction.clip_prediction_id
                == models.ClipPrediction.id,
            )
            .join(
                models.ModelRun,
                models.ModelRun.id == models.ModelRunPrediction.model_run_id,
            )
            .where(models.ModelRun.uuid == self.eq)
        )


class UserRunFilter(base.Filter):
    """Filter for predictions by user run."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.ClipPrediction,
                models.ClipPrediction.id
                == models.SoundEventPrediction.clip_prediction_id,
            )
            .join(
                models.UserRunPrediction,
                models.UserRunPrediction.clip_prediction_id
                == models.ClipPrediction.id,
            )
            .join(
                models.UserRun,
                models.UserRun.id == models.UserRunPrediction.user_run_id,
            )
            .where(models.UserRun.uuid == self.eq)
        )


class ClipFilter(base.Filter):
    """Filter for predictions by clip."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.ClipPrediction,
                models.ClipPrediction.id
                == models.SoundEventPrediction.clip_prediction_id,
            )
            .join(
                models.Clip,
                models.Clip.id == models.ClipPrediction.clip_id,
            )
            .where(models.Clip.uuid == self.eq)
        )


SoundEventPredictionFilter = base.combine(
    recording=RecordingFilter,
    sound_event=SoundEventFilter,
    clip_prediction=ClipPredictionFilter,
    tag=TagFilter,
    model_run=ModelRunFilter,
    user_run=UserRunFilter,
    clip=ClipFilter,
)
