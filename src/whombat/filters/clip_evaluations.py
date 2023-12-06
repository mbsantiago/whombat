"""Filters for Clip Evaluations."""

from sqlalchemy import Select, and_

from whombat import models
from whombat.filters import base


__all__ = [
    "ClipEvaluationFilter",
    "ClipAnnotationFilter",
    "ClipPredictionFilter",
    "ScoreFilter",
    "CreatedOnFilter",
    "EvaluationFilter",
    "MetricFilter",
    "PredictionTagFilter",
    "AnnotationTagFilter",
]

UUIDFilter = base.uuid_filter(models.ClipEvaluation.uuid)

ClipAnnotationFilter = base.integer_filter(
    models.ClipEvaluation.clip_annotation_id
)

ClipPredictionFilter = base.integer_filter(
    models.ClipEvaluation.clip_prediction_id
)

ScoreFilter = base.float_filter(models.ClipEvaluation.score)

CreatedOnFilter = base.date_filter(models.ClipEvaluation.created_on)

EvaluationFilter = base.integer_filter(models.ClipEvaluation.evaluation_id)


class MetricFilter(base.Filter):
    """Filter for evalutions with a specific metric."""

    name: str | None = None
    gt: float | None = None
    lt: float | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by metric."""
        if self.name is None:
            return query

        query = query.join(
            models.ClipEvaluationMetric,
            models.ClipEvaluationMetric.clip_evaluation_id
            == models.ClipEvaluation.id,
        ).join(
            models.FeatureName,
            models.FeatureName.id
            == models.ClipEvaluationMetric.feature_name_id,
        )

        if self.gt is None and self.lt is None:
            return query.filter(models.FeatureName.name == self.name)

        if self.gt is not None:
            return query.filter(
                and_(
                    models.FeatureName.name == self.name,
                    models.ClipEvaluationMetric.value > self.gt,
                )
            )

        return query.filter(
            and_(
                models.FeatureName.name == self.name,
                models.ClipEvaluationMetric.value < self.lt,
            )
        )


class PredictionTagFilter(base.Filter):
    """Filter for clip evaluations with a specific prediction tag."""

    eq: int | None = None
    gt: int | None = None
    lt: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by prediction tag."""
        if self.eq is None:
            return query

        query = query.join(
            models.ClipPrediction,
            models.ClipPrediction.id
            == models.ClipEvaluation.clip_prediction_id,
        ).join(
            models.ClipPredictionTag,
            models.ClipPredictionTag.clip_prediction_id
            == models.ClipPrediction.id,
        )

        if self.gt is None and self.lt is None:
            return query.filter(models.ClipPredictionTag.tag_id == self.eq)

        if self.gt is not None:
            return query.filter(
                and_(
                    models.ClipPredictionTag.tag_id == self.eq,
                    models.ClipPredictionTag.score > self.gt,
                )
            )

        return query.filter(
            and_(
                models.ClipPredictionTag.tag_id == self.eq,
                models.ClipPredictionTag.score < self.lt,
            )
        )


class AnnotationTagFilter(base.Filter):
    """Filter for clip evaluations with a specific annotation tag."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by annotation tag."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.ClipAnnotation,
                models.ClipAnnotation.id
                == models.ClipEvaluation.clip_annotation_id,
            )
            .join(
                models.ClipAnnotationTag,
                models.ClipAnnotationTag.clip_annotation_id
                == models.ClipAnnotation.id,
            )
            .filter(models.ClipAnnotationTag.tag_id == self.eq)
        )


ClipEvaluationFilter = base.combine(
    uuid=UUIDFilter,
    clip_annotation=ClipAnnotationFilter,
    clip_prediction=ClipPredictionFilter,
    score=ScoreFilter,
    created_on=CreatedOnFilter,
    evaluation=EvaluationFilter,
    metric=MetricFilter,
    prediction_tag=PredictionTagFilter,
    annotation_tag=AnnotationTagFilter,
)
