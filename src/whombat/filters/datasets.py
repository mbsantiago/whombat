"""Filters for Datasets."""

from whombat import models
from whombat.filters import base

__all__ = [
    "CreatedOnFilter",
    "DatasetFilter",
    "SearchFilter",
]


SearchFilter = base.search_filter(
    [
        models.Dataset.name,
        models.Dataset.description,
    ]
)


CreatedOnFilter = base.date_filter(
    models.Dataset.created_on,
)


DatasetFilter = base.combine(
    SearchFilter,
    created_on=CreatedOnFilter,
)
