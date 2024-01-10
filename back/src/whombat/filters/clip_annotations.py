"""Filters for Clip Annotations."""

from uuid import UUID

from sqlalchemy import Select, select

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

    key: str | None = None
    value: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter clip if it has a specific tag."""
        if self.key is None and self.value is None:
            return query

        query = query.join(
            models.ClipAnnotationTag,
            models.ClipAnnotationTag.clip_annotation_id
            == models.ClipAnnotation.id,
        ).join(
            models.Tag,
            models.Tag.id == models.ClipAnnotationTag.tag_id,
        )

        if self.key is None:
            return query.filter(models.Tag.value == self.value)

        if self.value is None:
            return query.filter(models.Tag.key == self.key)

        return query.filter(
            models.Tag.key == self.key,
            models.Tag.value == self.value,
        )


class AnnotationProjectFilter(base.Filter):
    """Filter clip annotations by annotation project."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter clip annotations by annotation project."""
        if self.eq is None:
            return query

        subquery = (
            select(models.ClipAnnotation.id)
            .join(
                models.AnnotationTask,
                models.AnnotationTask.clip_annotation_id
                == models.ClipAnnotation.id,
            )
            .join(
                models.AnnotationProject,
                models.AnnotationProject.id
                == models.AnnotationTask.annotation_project_id,
            )
            .filter(models.AnnotationProject.uuid == self.eq)
        )

        return query.filter(models.ClipAnnotation.id.in_(subquery))


class EvaluationSetFilter(base.Filter):
    """Filter clip annotations by evaluation set."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter clip annotations by evaluation set."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.EvaluationSetAnnotation,
                models.EvaluationSetAnnotation.clip_annotation_id
                == models.ClipAnnotation.id,
            )
            .join(
                models.EvaluationSet,
                models.EvaluationSet.id
                == models.EvaluationSetAnnotation.evaluation_set_id,
            )
            .filter(models.EvaluationSet.uuid == self.eq)
        )


ClipAnnotationFilter = base.combine(
    uuid=UUIDFilter,
    clip=ClipFilter,
    tag=TagFilter,
    annotation_project=AnnotationProjectFilter,
    evaluation_set=EvaluationSetFilter,
)
