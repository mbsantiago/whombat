"""Filters for Evaluation Sets."""

from whombat import models
from whombat.filters import base

__all__ = [
    "SearchFilter",
    "EvaluationSetFilter",
]


SearchFilter = base.search_filter(
    [
        models.EvaluationSet.name,
        models.EvaluationSet.description,
    ]
)


EvaluationSetFilter = base.combine(
    SearchFilter,
)
