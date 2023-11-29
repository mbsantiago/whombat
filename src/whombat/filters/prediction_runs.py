"""Filters for Model Runs."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "PredictionRunFilter",
    "EvaluationSetFilter",
    "CreatedAtFilter",
    "UserFilter",
    "ModelNameFilter",
    "ModelVersionFilter",
    "ScoreFilter",
    "HasEvaluationFilter",
    "IsModelRun",
]


UserFilter = base.uuid_filter(models.PredictionRun.user_id)
"""Filter model runs by user ID."""

ModelNameFilter = base.string_filter(models.PredictionRun.model_name)
"""Filter model runs by model name."""

ModelVersionFilter = base.string_filter(models.PredictionRun.model_version)
"""Filter model runs by model version."""

EvaluationSetFilter = base.integer_filter(
    models.PredictionRun.evaluation_set_id
)
"""Filter model runs by evaluation set ID."""

CreatedAtFilter = base.date_filter(models.PredictionRun.created_at)
"""Filter model runs by creation date."""


class ScoreFilter(base.Filter):
    """Filter model runs by score."""

    lt: float | None = None

    gt: float | None = None

    def filter(self, query: Select) -> Select:
        """Apply the filter."""
        if self.lt is None and self.gt is None:
            return query

        query = query.join(
            models.Evaluation,
            models.Evaluation.prediction_run_id == models.PredictionRun.id,
        ).where(models.Evaluation.score.isnot(None))

        if self.lt is not None:
            query = query.where(models.Evaluation.score < self.lt)

        if self.gt is not None:
            query = query.where(models.Evaluation.score > self.gt)

        return query


class HasEvaluationFilter(base.Filter):
    """Filter model runs by whether they have an evaluation."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Apply the filter."""
        if self.eq is None:
            return query

        return query.where(models.PredictionRun.evaluation.any() == self.eq)


class IsModelRun(base.Filter):
    """Filter model runs by whether they are a model run."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Apply the filter."""
        if self.eq is None:
            return query

        if self.eq:
            return query.where(
                models.PredictionRun.model_name != None  # noqa: E711
            )

        return query.where(
            models.PredictionRun.model_name == None  # noqa: E711
        )


PredictionRunFilter = base.combine(
    user=UserFilter,
    model_name=ModelNameFilter,
    model_version=ModelVersionFilter,
    evaluation_set=EvaluationSetFilter,
    created_at=CreatedAtFilter,
    is_model=IsModelRun,
    evaluated=HasEvaluationFilter,
    score=ScoreFilter,
)
