"""Filters for Annotations."""
from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "ProjectFilter",
    "AnnotationFilter",
    "RecordingFilter",
    "SoundEventFilter",
    "CreatedByFilter",
    "TaskFilter",
    "TagFilter",
]

TaskFilter = base.integer_filter(
    models.SoundEventAnnotation.clip_annotation_id,
)

SoundEventFilter = base.integer_filter(
    models.SoundEventAnnotation.sound_event_id,
)

CreatedByFilter = base.string_filter(
    models.SoundEventAnnotation.created_by_id,
)


class ProjectFilter(base.Filter):
    """Filter for annotations by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(
            models.AnnotationTask,
            models.AnnotationTask.id
            == models.SoundEventAnnotation.clip_annotation_id,
        ).where(
            models.AnnotationTask.annotation_project_id == self.eq,
        )


class RecordingFilter(base.Filter):
    """Filter for annotations by dataset."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.AnnotationTask,
                models.AnnotationTask.id
                == models.SoundEventAnnotation.clip_annotation_id,
            )
            .join(
                models.Clip,
                models.Clip.id == models.AnnotationTask.clip_id,
            )
            .where(
                models.Clip.recording_id == self.eq,
            )
        )


class TagFilter(base.Filter):
    """Filter for annotations by tag."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(models.SoundEventAnnotationTag).where(
            models.SoundEventAnnotationTag.tag_id == self.eq,
        )


AnnotationFilter = base.combine(
    project=ProjectFilter,
    recording=RecordingFilter,
    sound_event=SoundEventFilter,
    created_by=CreatedByFilter,
    task=TaskFilter,
    tag=TagFilter,
)
