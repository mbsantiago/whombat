"""Filters for Clip Evaluations."""

from uuid import UUID

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

ScoreFilter = base.float_filter(models.ClipEvaluation.score)

CreatedOnFilter = base.date_filter(models.ClipEvaluation.created_on)


class EvaluationFilter(base.Filter):
    """Filter for clip evaluations with a specific evaluation."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by evaluation."""
        if self.eq is None:
            return query

        return query.join(
            models.Evaluation,
            models.Evaluation.id == models.ClipEvaluation.evaluation_id,
        ).filter(models.Evaluation.uuid == self.eq)


class ClipAnnotationFilter(base.Filter):
    """Filter for clip evaluations with a specific clip annotation."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by clip annotation."""
        if self.eq is None:
            return query

        return query.join(
            models.ClipAnnotation,
            models.ClipAnnotation.id
            == models.ClipEvaluation.clip_annotation_id,
        ).filter(models.ClipAnnotation.uuid == self.eq)


class ClipPredictionFilter(base.Filter):
    """Filter for clip evaluations with a specific clip prediction."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by clip prediction."""
        if self.eq is None:
            return query

        return query.join(
            models.ClipPrediction,
            models.ClipPrediction.id
            == models.ClipEvaluation.clip_prediction_id,
        ).filter(models.ClipPrediction.uuid == self.eq)


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

    key: str | None = None
    value: str | None = None
    gt: int | None = None
    lt: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by prediction tag."""
        if self.key is None and self.value is None:
            return query

        query = (
            query.join(
                models.ClipPrediction,
                models.ClipPrediction.id
                == models.ClipEvaluation.clip_prediction_id,
            )
            .join(
                models.ClipPredictionTag,
                models.ClipPredictionTag.clip_prediction_id
                == models.ClipPrediction.id,
            )
            .join(
                models.Tag,
                models.Tag.id == models.ClipPredictionTag.tag_id,
            )
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

        return query.filter(*conditions)


class AnnotationTagFilter(base.Filter):
    """Filter for clip evaluations with a specific annotation tag."""

    key: str | None = None
    value: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter query by annotation tag."""
        if self.key is None and self.value is None:
            return query

        query = (
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
            .join(
                models.Tag,
                models.Tag.id == models.ClipAnnotationTag.tag_id,
            )
        )

        conditions = []
        if self.key is not None:
            conditions.append(models.Tag.key == self.key)

        if self.value is not None:
            conditions.append(models.Tag.value == self.value)

        return query.filter(*conditions)


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
