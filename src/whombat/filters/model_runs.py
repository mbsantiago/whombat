"""Filters for Model Runs."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "ModelRunFilter",
    "CreatedOnFilter",
    "NameFilter",
    "VersionFilter",
    "ScoreFilter",
    "HasEvaluationFilter",
]


NameFilter = base.string_filter(models.ModelRun.name)
"""Filter model runs by model name."""

VersionFilter = base.string_filter(models.ModelRun.version)
"""Filter model runs by model version."""

CreatedOnFilter = base.date_filter(models.ModelRun.created_on)
"""Filter model runs by creation date."""


class ScoreFilter(base.Filter):
    """Filter model runs by score."""

    lt: float | None = None

    gt: float | None = None

    def filter(self, query: Select) -> Select:
        """Apply the filter."""
        if self.lt is None and self.gt is None:
            return query

        query = (
            query.join(
                models.ModelRunEvaluation,
                models.ModelRunEvaluation.model_run_id == models.ModelRun.id,
            )
            .join(
                models.Evaluation,
                models.Evaluation.id
                == models.ModelRunEvaluation.evaluation_id,
            )
            .where(models.Evaluation.score.isnot(None))
        )

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

        return query.where(models.ModelRun.evaluations.any())


ModelRunFilter = base.combine(
    model_name=NameFilter,
    model_version=VersionFilter,
    created_on=CreatedOnFilter,
    evaluated=HasEvaluationFilter,
    score=ScoreFilter,
)
