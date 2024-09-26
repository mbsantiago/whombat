"""Filters for Sound Event Annotations."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "TagFilter",
    "AnnotationProjectFilter",
    "EvaluationSetFilter",
    "SoundEventAnnotationTagFilter",
]


class TagFilter(base.Filter):
    """Filter clip if it has a specific tag."""

    key: str | None = None
    value: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter clip if it has a specific tag."""
        if self.key is None and self.value is None:
            return query

        query = query.join(
            models.Tag,
            models.Tag.id == models.SoundEventAnnotationTag.tag_id,
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

        return (
            query.join(
                models.SoundEventAnnotation,
                models.SoundEventAnnotation.id
                == models.SoundEventAnnotationTag.sound_event_annotation_id,
            )
            .join(
                models.ClipAnnotation,
                models.ClipAnnotation.id
                == models.SoundEventAnnotation.clip_annotation_id,
            )
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


class EvaluationSetFilter(base.Filter):
    """Filter sound_event annotations by evaluation set."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter sound_event annotations by evaluation set."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.SoundEventAnnotation,
                models.SoundEventAnnotation.id
                == models.SoundEventAnnotationTag.sound_event_annotation_id,
            )
            .join(
                models.ClipAnnotation,
                models.ClipAnnotation.id
                == models.SoundEventAnnotation.clip_annotation_id,
            )
            .join(
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


SoundEventAnnotationTagFilter = base.combine(
    tag=TagFilter,
    annotation_project=AnnotationProjectFilter,
    evaluation_set=EvaluationSetFilter,
)
