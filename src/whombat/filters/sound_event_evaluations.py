"""Filters for Sound Event Evaluations."""

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


ClipEvaluationFilter = base.integer_filter(
    models.SoundEventEvaluation.clip_evaluation_id
)


ScoreFilter = base.float_filter(models.SoundEventEvaluation.score)


TargetFilter = base.integer_filter(models.SoundEventEvaluation.target_id)


SourceFilter = base.integer_filter(models.SoundEventEvaluation.source_id)


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

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by target tag."""
        if self.eq is None:
            return query

        return (
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
            .filter(models.SoundEventAnnotationTag.tag_id == self.eq)
        )


class SourceTagFilter(base.Filter):
    """Filter for evaluations whose source has a specific tag."""

    eq: int | None = None

    gt: float | None = None

    lt: float | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by source tag."""
        if self.eq is None:
            return query

        query = query.join(
            models.SoundEventPrediction,
            models.SoundEventPrediction.id
            == models.SoundEventEvaluation.source_id,
        ).join(
            models.SoundEventPredictionTag,
            models.SoundEventPredictionTag.sound_event_prediction_id
            == models.SoundEventPrediction.id,
        )

        if self.gt is None and self.lt is None:
            return query.filter(
                models.SoundEventPredictionTag.tag_id == self.eq
            )

        if self.gt is not None:
            return query.filter(
                and_(
                    models.SoundEventPredictionTag.tag_id == self.eq,
                    models.SoundEventPredictionTag.score > self.gt,
                )
            )

        return query.filter(
            and_(
                models.SoundEventPredictionTag.tag_id == self.eq,
                models.SoundEventPredictionTag.score < self.lt,
            )
        )


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

