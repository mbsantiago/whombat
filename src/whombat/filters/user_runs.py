"""Filters for User Runs."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "UserFilter",
    "UserRunFilter",
    "HasEvaluationFilter",
    "EvaluationSetFilter",
]

CreatedOnFilter = base.date_filter(models.UserRun.created_on)


UserFilter = base.integer_filter(models.UserRun.user_id)


class HasEvaluationFilter(base.Filter):
    """Filter for user runs that have an evaluation."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter for user runs that have an evaluation."""
        if self.eq is None:
            return query

        if self.eq:
            return query.filter(models.UserRun.evaluations.any())

        return query.filter(~models.UserRun.evaluations.any())


class EvaluationSetFilter(base.Filter):
    """Filter for user runs that are in an evaluation set."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter for user runs that are in an evaluation set."""
        if self.eq is None:
            return query

        return query.join(
            models.EvaluationSetUserRun,
            models.EvaluationSetUserRun.user_run_id == models.UserRun.id,
        ).filter(models.EvaluationSetUserRun.evaluation_set_id == self.eq)


UserRunFilter = base.combine(
    user=UserFilter,
    has_evaluation=HasEvaluationFilter,
    evaluation_set=EvaluationSetFilter,
    created_on=CreatedOnFilter,
)
