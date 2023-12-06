"""Filters for Clip Annotations."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "UUIDFilter",
    "ClipFilter",
    "TagFilter",
    "AnnotationProjectFilter",
    "EvaluationSetFilter",
    "ClipAnnotationFilter",
]

UUIDFilter = base.uuid_filter(models.ClipAnnotation.uuid)

ClipFilter = base.integer_filter(models.ClipAnnotation.clip_id)


class TagFilter(base.Filter):
    """Filter clip if it has a specific tag."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter clip if it has a specific tag."""
        if self.eq is None:
            return query

        return query.filter(
            models.ClipAnnotation.tags.any(models.Tag.id == self.eq)
        )


class AnnotationProjectFilter(base.Filter):
    """Filter clip annotations by annotation project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter clip annotations by annotation project."""
        if self.eq is None:
            return query

        return query.join(
            models.AnnotationTask,
            models.AnnotationTask.clip_annotation_id
            == models.ClipAnnotation.id,
        ).filter(models.AnnotationTask.annotation_project_id == self.eq)


class EvaluationSetFilter(base.Filter):
    """Filter clip annotations by evaluation set."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter clip annotations by evaluation set."""
        if self.eq is None:
            return query

        return query.join(
            models.EvaluationSetAnnotation,
            models.EvaluationSetAnnotation.clip_annotation_id
            == models.ClipAnnotation.id,
        ).filter(models.EvaluationSetAnnotation.evaluation_set_id == self.eq)


ClipAnnotationFilter = base.combine(
    uuid=UUIDFilter,
    clip=ClipFilter,
    tag=TagFilter,
    annotation_project=AnnotationProjectFilter,
    evaluation_set=EvaluationSetFilter,
)
