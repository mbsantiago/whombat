"""Filters for Evaluations."""

from uuid import UUID

from sqlalchemy import Select, or_, select

from whombat import models
from whombat.filters import base

__all__ = [
    "EvaluationFilter",
]


UUIDFilter = base.uuid_filter(models.Evaluation.uuid)


ScoreFilter = base.float_filter(models.Evaluation.score)


TaskFilter = base.string_filter(models.Evaluation.task)


CreatedOnFilter = base.date_filter(models.Evaluation.created_on)


class ModelRunFilter(base.Filter):
    """Filter by model run."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return (
            query.join(
                models.ModelRunEvaluation,
                models.ModelRunEvaluation.evaluation_id
                == models.Evaluation.id,
            )
            .join(
                models.ModelRun,
                models.ModelRun.id == models.ModelRunEvaluation.model_run_id,
            )
            .filter(models.ModelRun.uuid == self.eq)
        )


class UserRunFilter(base.Filter):
    """Filter by user run."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return (
            query.join(
                models.UserRunEvaluation,
                models.UserRunEvaluation.evaluation_id == models.Evaluation.id,
            )
            .join(
                models.UserRun,
                models.UserRun.id == models.UserRunEvaluation.user_run_id,
            )
            .filter(models.UserRun.uuid == self.eq)
        )


class EvaluationSetFilter(base.Filter):
    """Filter by evaluation set."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        subquery1 = (
            select(models.Evaluation.id)
            .join(
                models.ModelRunEvaluation,
                models.ModelRunEvaluation.evaluation_id
                == models.Evaluation.id,
            )
            .join(
                models.EvaluationSet,
                models.EvaluationSet.id
                == models.ModelRunEvaluation.evaluation_set_id,
            )
            .filter(models.EvaluationSet.uuid == self.eq)
        )

        subquery2 = (
            select(models.Evaluation.id)
            .join(
                models.UserRunEvaluation,
                models.UserRunEvaluation.evaluation_id == models.Evaluation.id,
            )
            .join(
                models.EvaluationSet,
                models.EvaluationSet.id
                == models.UserRunEvaluation.evaluation_set_id,
            )
            .filter(models.EvaluationSet.uuid == self.eq)
        )

        return query.filter(
            or_(
                models.Evaluation.id.in_(subquery1),
                models.Evaluation.id.in_(subquery2),
            )
        )


EvaluationFilter = base.combine(
    score=ScoreFilter,
    uuid=UUIDFilter,
    task=TaskFilter,
    created_on=CreatedOnFilter,
    model_run=ModelRunFilter,
    user_run=UserRunFilter,
    evaluation_set=EvaluationSetFilter,
)
