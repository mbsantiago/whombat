"""Filters for Evaluation Sets."""

from whombat import models
from whombat.filters import base

__all__ = [
    "CreatedOnFilter",
    "EvaluationSetFilter",
    "SearchFilter",
]


SearchFilter = base.search_filter(
    [
        models.EvaluationSet.name,
        models.EvaluationSet.description,
    ]
)


CreatedOnFilter = base.date_filter(
    models.EvaluationSet.created_on,
)


EvaluationSetFilter = base.combine(
    SearchFilter,
    created_on=CreatedOnFilter,
)
