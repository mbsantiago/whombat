"""Filters for Datasets."""

from whombat import models
from whombat.filters import base

__all__ = [
    "SearchFilter",
    "DatasetFilter",
]


SearchFilter = base.search_filter(
    [
        models.Dataset.name,
        models.Dataset.description,
    ]
)


DatasetFilter = base.combine(
    SearchFilter,
)
