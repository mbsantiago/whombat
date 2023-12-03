"""Filters for Task Tags."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "CreatedOnFilter",
    "KeyFilter",
    "ProjectFilter",
    "SearchFilter",
    "TagFilter",
    "ClipAnnotationFilter",
    "TaskTagFilter",
    "UserFilter",
    "ValueFilter",
]

TagFilter = base.integer_filter(models.ClipAnnotationTag.tag_id)
"""Filter clip annotation tag by tag."""


ClipAnnotationFilter = base.integer_filter(
    models.ClipAnnotationTag.clip_annotation_id
)
"""Filter tag by the clip annotation to which it belongs."""


CreatedOnFilter = base.date_filter(models.ClipAnnotationTag.created_on)
"""Filter tag by creation date."""


class UserFilter(base.Filter):
    """Filter tags by the user who added them."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.where(models.ClipAnnotationTag.created_by_id == self.eq)


class KeyFilter(base.Filter):
    """Filter task tags by key."""

    eq: str | None = None
    has: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.has:
            return query

        query = query.join(
            models.Tag, models.Tag.id == models.ClipAnnotationTag.tag_id
        )

        if self.eq:
            query = query.where(models.Tag.key == self.eq)

        if self.has:
            query = query.where(models.Tag.key.contains(self.has))

        return query


class ValueFilter(base.Filter):
    """Filter task tags by value."""

    eq: str | None = None
    has: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.has:
            return query

        query = query.join(
            models.Tag, models.Tag.id == models.ClipAnnotationTag.tag_id
        )

        if self.eq:
            query = query.where(models.Tag.value == self.eq)

        if self.has:
            query = query.where(models.Tag.value.contains(self.has))

        return query


class SearchFilter(base.Filter):
    """Filter task tags by key or value."""

    search: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.search:
            return query

        return query.join(
            models.Tag, models.Tag.id == models.ClipAnnotationTag.tag_id
        ).where(
            models.Tag.key.contains(self.search)
            | models.Tag.value.contains(self.search)
        )


class ProjectFilter(base.Filter):
    """Filter task tags by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        query = query.join(
            models.ClipAnnotation,
            models.ClipAnnotation.id
            == models.ClipAnnotationTag.clip_annotation_id,
        ).join(
            models.AnnotationTask,
            models.AnnotationTask.clip_id == models.ClipAnnotation.clip_id,
        )

        return query.where(models.AnnotationTask.annotation_project_id == self.eq)


TaskTagFilter = base.combine(
    SearchFilter,
    tag=TagFilter,
    value=ValueFilter,
    key=KeyFilter,
    task=ClipAnnotationFilter,
    project=ProjectFilter,
    user=UserFilter,
    created_on=CreatedOnFilter,
)
