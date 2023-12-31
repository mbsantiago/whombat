"""Filters for Model Runs."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "SearchFilter",
    "ModelRunFilter",
    "CreatedOnFilter",
    "NameFilter",
    "VersionFilter",
    "ScoreFilter",
    "HasEvaluationFilter",
]

SearchFilter = base.search_filter(
    [models.ModelRun.name, models.ModelRun.version]
)


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


class EvaluationSetFilter(base.Filter):
    """Filter for model runs that are in an evaluation set."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter for user runs that are in an evaluation set."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.EvaluationSetModelRun,
                models.EvaluationSetModelRun.model_run_id
                == models.ModelRun.id,
            )
            .join(
                models.EvaluationSet,
                models.EvaluationSet.id
                == models.EvaluationSetModelRun.evaluation_set_id,
            )
            .where(models.EvaluationSet.uuid == self.eq)
        )


ModelRunFilter = base.combine(
    SearchFilter,
    name=NameFilter,
    version=VersionFilter,
    created_on=CreatedOnFilter,
    evaluated=HasEvaluationFilter,
    score=ScoreFilter,
    evaluation_set=EvaluationSetFilter,
    has_evaluation=HasEvaluationFilter,
)
