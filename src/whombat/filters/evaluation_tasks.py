"""Filters for Evaluation Tasks."""

from whombat import models
from whombat.filters import base

__all__ = [
    "EvaluationSetFilter",
    "EvaluationTaskFilter",
]


EvaluationSetFilter = base.integer_filter(
    models.EvaluationTask.evaluation_set_id
)
"""Filter for the evaluation set ID of an evaluation task."""


EvaluationTaskFilter = base.combine(
    evaluation_set=EvaluationSetFilter,
)
