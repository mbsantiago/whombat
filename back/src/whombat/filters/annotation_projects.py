"""Filters for Datasets."""

from whombat import models
from whombat.filters import base

__all__ = [
    "SearchFilter",
    "AnnotationProjectFilter",
]


SearchFilter = base.search_filter(
    [
        models.AnnotationProject.name,
        models.AnnotationProject.description,
    ]
)

CreatedOnFilter = base.date_filter(models.AnnotationProject.created_on)

AnnotationProjectFilter = base.combine(
    SearchFilter,
    created_on=CreatedOnFilter,
)
