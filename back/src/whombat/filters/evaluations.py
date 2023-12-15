"""Filters for Evaluations."""
from uuid import UUID

from sqlalchemy import Select, or_
from sqlalchemy.orm import aliased

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

        EvalSetModelRun = aliased(models.EvaluationSet)
        EvalSetUserRun = aliased(models.EvaluationSet)

        return (
            query.join(
                models.UserRunEvaluation,
                models.UserRunEvaluation.evaluation_id == models.Evaluation.id,
            )
            .join(
                models.UserRun,
                models.UserRun.id == models.UserRunEvaluation.user_run_id,
            )
            .join(
                models.ModelRunEvaluation,
                models.ModelRunEvaluation.evaluation_id
                == models.Evaluation.id,
            )
            .join(
                models.ModelRun,
                models.ModelRun.id == models.ModelRunEvaluation.model_run_id,
            )
            .join(
                models.EvaluationSetUserRun,
                models.EvaluationSetUserRun.user_run_id == models.UserRun.id,
            )
            .join(
                models.EvaluationSetModelRun,
                models.EvaluationSetModelRun.model_run_id
                == models.ModelRun.id,
            )
            .join(
                EvalSetUserRun,
                EvalSetUserRun.id
                == models.EvaluationSetUserRun.evaluation_set_id,
            )
            .join(
                EvalSetModelRun,
                EvalSetModelRun.id
                == models.EvaluationSetModelRun.evaluation_set_id,
            )
            .filter(
                or_(
                    EvalSetUserRun.uuid == self.eq,
                    EvalSetModelRun.uuid == self.eq,
                )
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
