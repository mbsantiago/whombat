"""Filters for Sound Event Evaluations."""

from uuid import UUID

from sqlalchemy import Select, and_

from whombat import models
from whombat.filters import base

__all__ = [
    "ClipEvaluationFilter",
    "ScoreFilter",
    "MetricFilter",
    "HasSourceFilter",
    "HasTargetFilter",
    "TargetTagFilter",
    "SourceTagFilter",
    "TargetFilter",
    "SourceFilter",
    "SoundEventEvaluationFilter",
]


ScoreFilter = base.float_filter(models.SoundEventEvaluation.score)


class ClipEvaluationFilter(base.Filter):
    """Filter for clip evaluations of sound event evaluations."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by clip evaluation."""
        if self.eq is None:
            return query

        return query.join(
            models.ClipEvaluation,
            models.ClipEvaluation.id
            == models.SoundEventEvaluation.clip_evaluation_id,
        ).filter(models.ClipEvaluation.uuid == self.eq)


class TargetFilter(base.Filter):
    """Filter for targets of sound event evaluations."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by target."""
        if self.eq is None:
            return query

        return query.join(
            models.SoundEventAnnotation,
            models.SoundEventAnnotation.id
            == models.SoundEventEvaluation.target_id,
        ).filter(models.SoundEventAnnotation.uuid == self.eq)


class SourceFilter(base.Filter):
    """Filter for sources of sound event evaluations."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by source."""
        if self.eq is None:
            return query

        return query.join(
            models.SoundEventPrediction,
            models.SoundEventPrediction.id
            == models.SoundEventEvaluation.source_id,
        ).filter(models.SoundEventPrediction.uuid == self.eq)


class MetricFilter(base.Filter):
    """Filter for metrics of sound event evaluations."""

    name: str | None = None
    gt: float | None = None
    lt: float | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by metric."""
        if self.name is None:
            return query

        query = query.join(
            models.SoundEventEvaluationMetric,
            models.SoundEventEvaluationMetric.sound_event_evaluation_id
            == models.SoundEventEvaluation.id,
        ).join(
            models.FeatureName,
            models.FeatureName.id
            == models.SoundEventEvaluationMetric.feature_name_id,
        )

        if self.gt is None and self.lt is None:
            return query.filter(models.FeatureName.name == self.name)

        if self.gt is not None:
            return query.filter(
                and_(
                    models.FeatureName.name == self.name,
                    models.SoundEventEvaluationMetric.value > self.gt,
                )
            )

        return query.filter(
            and_(
                models.FeatureName.name == self.name,
                models.SoundEventEvaluationMetric.value < self.lt,
            )
        )


class HasSourceFilter(base.Filter):
    """Filter for sound event evaluations with a source."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by source."""
        if self.eq is None:
            return query

        return query.filter(
            models.SoundEventEvaluation.source_id.isnot(None) == self.eq
        )


class HasTargetFilter(base.Filter):
    """Filter for sound event evaluations with a target."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by target."""
        if self.eq is None:
            return query

        return query.filter(
            models.SoundEventEvaluation.target_id.isnot(None) == self.eq
        )


class TargetTagFilter(base.Filter):
    """Filter for evaluations whose target has a specific tag."""

    key: str | None = None
    value: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by target tag."""
        if self.key is None and self.value is None:
            return query

        query = (
            query.join(
                models.SoundEventAnnotation,
                models.SoundEventAnnotation.id
                == models.SoundEventEvaluation.target_id,
            )
            .join(
                models.SoundEventAnnotationTag,
                models.SoundEventAnnotationTag.sound_event_annotation_id
                == models.SoundEventAnnotation.id,
            )
            .join(
                models.Tag,
                models.Tag.id == models.SoundEventAnnotationTag.tag_id,
            )
        )

        conditions = []
        if self.key is not None:
            conditions.append(models.Tag.key == self.key)

        if self.value is not None:
            conditions.append(models.Tag.value == self.value)

        return query.filter(*conditions)


class SourceTagFilter(base.Filter):
    """Filter for evaluations whose source has a specific tag."""

    key: str | None = None
    value: str | None = None

    gt: float | None = None

    lt: float | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by source tag."""
        if self.key is None and self.value is None:
            return query

        query = (
            query.join(
                models.SoundEventPrediction,
                models.SoundEventPrediction.id
                == models.SoundEventEvaluation.source_id,
            )
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
            conditions.append(
                models.SoundEventPredictionTag.score > self.gt,
            )
        if self.lt is not None:
            conditions.append(
                models.SoundEventPredictionTag.score < self.lt,
            )

        return query.filter(*conditions)


SoundEventEvaluationFilter = base.combine(
    clip_evaluation=ClipEvaluationFilter,
    score=ScoreFilter,
    metric=MetricFilter,
    target=TargetFilter,
    source=SourceFilter,
    has_source=HasSourceFilter,
    has_target=HasTargetFilter,
    target_tag=TargetTagFilter,
    source_tag=SourceTagFilter,
)
