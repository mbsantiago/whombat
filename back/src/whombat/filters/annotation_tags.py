"""Filters for Annotation Tags."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "AnnotationFilter",
    "TagFilter",
    "KeyFilter",
    "ValueFilter",
    "SearchFilter",
    "CreatedAtFilter",
    "AnnotationTagFilter",
    "TaskFilter",
    "RecordingFilter",
    "ProjectFilter",
]

TagFilter = base.integer_filter(models.AnnotationTag.tag_id)
"""Filter annotation tag by tag."""


AnnotationFilter = base.integer_filter(models.AnnotationTag.annotation_id)
"""Filter annotation tag by annotation."""


CreatedAtFilter = base.date_filter(models.AnnotationTag.created_at)
"""Filter annotation tags by creation date."""


class KeyFilter(base.Filter):
    """Filter annotation tags by key."""

    eq: str | None = None
    has: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.has:
            return query

        query = query.join(
            models.Tag, models.Tag.id == models.AnnotationTag.tag_id
        )

        if self.eq:
            query = query.where(models.Tag.key == self.eq)

        if self.has:
            query = query.where(models.Tag.key.contains(self.has))

        return query


class ValueFilter(base.Filter):
    """Filter annotation tags by value."""

    eq: str | None = None
    has: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq and not self.has:
            return query

        query = query.join(
            models.Tag, models.Tag.id == models.AnnotationTag.tag_id
        )

        if self.eq:
            query = query.where(models.Tag.value == self.eq)

        if self.has:
            query = query.where(models.Tag.value.contains(self.has))

        return query


class SearchFilter(base.Filter):
    """Filter annotation tags by key or value."""

    search: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.search:
            return query

        return query.join(
            models.Tag, models.Tag.id == models.AnnotationTag.tag_id
        ).where(
            models.Tag.key.contains(self.search)
            | models.Tag.value.contains(self.search)
        )


class TaskFilter(base.Filter):
    """Filter annotation tags by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(
            models.Annotation,
            models.Annotation.id == models.AnnotationTag.annotation_id,
        ).where(
            models.Annotation.task_id == self.eq,
        )


class RecordingFilter(base.Filter):
    """Filter annotation tags by recording."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Annotation,
                models.Annotation.id == models.AnnotationTag.annotation_id,
            )
            .join(
                models.Task,
                models.Task.id == models.Annotation.task_id,
            )
            .join(
                models.Clip,
                models.Clip.id == models.Task.clip_id,
            )
            .where(
                models.Clip.recording_id == self.eq,
            )
        )


class ProjectFilter(base.Filter):
    """Filter annotation tags by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(
            models.Annotation,
            models.Annotation.id == models.AnnotationTag.annotation_id,
        ).join(
            models.Task,
            models.Task.id == models.Annotation.task_id,
        ).where(
            models.Task.project_id == self.eq,
        )


AnnotationTagFilter = base.combine(
    SearchFilter,
    tag=TagFilter,
    value=ValueFilter,
    key=KeyFilter,
    annotation=AnnotationFilter,
    created_at=CreatedAtFilter,
    task=TaskFilter,
    recording=RecordingFilter,
    project=ProjectFilter,
)
