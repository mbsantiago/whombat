"""Filters for Clip Predictions."""

from sqlalchemy import Select, and_

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

ClipFilter = base.integer_filter(models.ClipPrediction.clip_id)


class RecordingFilter(base.Filter):
    """Filter prediction if it belongs to a specific recording."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return query.join(
            models.Clip,
            models.Clip.id == models.ClipPrediction.clip_id,
        ).filter(models.Clip.recording_id == self.eq)


class TagFilter(base.Filter):
    """Filter prediction if it has a specific tag."""

    eq: int | None = None
    gt: float | None = None
    lt: float | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        if self.gt is None and self.lt is None:
            return query.filter(
                models.ClipPrediction.tags.any(
                    models.ClipPredictionTag.tag_id == self.eq
                )
            )

        if self.gt is None:
            return query.filter(
                models.ClipPrediction.tags.any(
                    and_(
                        models.ClipPredictionTag.tag_id == self.eq,
                        models.ClipPredictionTag.score <= self.lt,
                    )
                )
            )

        return query.filter(
            models.ClipPrediction.tags.any(
                and_(
                    models.ClipPredictionTag.tag_id == self.eq,
                    models.ClipPredictionTag.score >= self.gt,
                )
            )
        )


class ModelRunFilter(base.Filter):
    """Filter prediction if it belongs to a specific model run."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query
        return query.join(
            models.ModelRunPrediction,
            models.ModelRunPrediction.clip_prediction_id
            == models.ClipPrediction.id,
        ).filter(models.ModelRunPrediction.model_run_id == self.eq)


class UserRunFilter(base.Filter):
    """Filter prediction if it belongs to a specific user run."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query
        return query.join(
            models.UserRunPrediction,
            models.UserRunPrediction.clip_prediction_id
            == models.ClipPrediction.id,
        ).filter(models.UserRunPrediction.user_run_id == self.eq)


ClipPredictionFilter = base.combine(
    uuid=UUIDFilter,
    clip=ClipFilter,
    recording=RecordingFilter,
    tag=TagFilter,
    model_run=ModelRunFilter,
    user_run=UserRunFilter,
)
