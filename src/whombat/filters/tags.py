"""Filters for tags."""
from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "KeyFilter",
    "ValueFilter",
    "SearchFilter",
    "ProjectFilter",
    "TagFilter",
]


KeyFilter = base.string_filter(models.Tag.key)
"""Filter tags by key."""

ValueFilter = base.string_filter(models.Tag.value)
"""Filter tags by value."""

SearchFilter = base.search_filter([models.Tag.key, models.Tag.value])
"""Search tags by key or value."""


class ProjectFilter(base.Filter):
    """Get tags for a project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by project."""
        if self.eq is None:
            return query

        return query.join(
            models.AnnotationProjectTag,
            models.AnnotationProjectTag.tag_id == models.Tag.id,
        ).where(models.AnnotationProjectTag.annotation_project_id == self.eq)


TagFilter = base.combine(
    SearchFilter,
    key=KeyFilter,
    value=ValueFilter,
    project=ProjectFilter,
)
