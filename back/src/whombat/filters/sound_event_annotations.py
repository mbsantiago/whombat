"""Filters for Annotations."""

from uuid import UUID

from sqlalchemy import Select, select, tuple_

from whombat import models
from whombat.filters import base

__all__ = [
    "ClipAnnotationFilter",
    "CreatedByFilter",
    "CreatedOnFilter",
    "ProjectFilter",
    "RecordingFilter",
    "SoundEventAnnotationFilter",
    "SoundEventFilter",
    "TagFilter",
]

CreatedOnFilter = base.date_filter(
    models.SoundEventAnnotation.created_on,
)


class ClipAnnotationFilter(base.Filter):
    """Filter for annotations by clip annotation."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(
            models.ClipAnnotation,
            models.ClipAnnotation.id
            == models.SoundEventAnnotation.clip_annotation_id,
        ).where(
            models.ClipAnnotation.uuid == self.eq,
        )


class SoundEventFilter(base.Filter):
    """Filter for annotations by sound event."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return query.join(
            models.SoundEvent,
            models.SoundEvent.id == models.SoundEventAnnotation.sound_event_id,
        ).where(models.SoundEvent.uuid == self.eq)


CreatedByFilter = base.string_filter(
    models.SoundEventAnnotation.created_by_id,
)


class ProjectFilter(base.Filter):
    """Filter for annotations by project."""

    eq: UUID | None = None

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
                models.AnnotationProject,
                models.AnnotationProject.id
                == models.AnnotationTask.annotation_project_id,
            )
            .filter(models.AnnotationProject.uuid == self.eq)
        )


class RecordingFilter(base.Filter):
    """Filter for annotations by dataset."""

    eq: UUID | None = None

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
            .join(
                models.Recording,
                models.Recording.id == models.Clip.recording_id,
            )
            .where(models.Recording.uuid == self.eq)
        )


class TagFilter(base.Filter):
    """Filter for annotations by tag."""

    key: str | None = None
    value: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.key is None and self.value is None:
            return query

        subquery = (
            select(models.SoundEventAnnotation.id)
            .join(
                models.SoundEventAnnotationTag,
                models.SoundEventAnnotationTag.sound_event_annotation_id
                == models.SoundEventAnnotation.id,
            )
            .join(
                models.Tag,
                models.Tag.id == models.SoundEventAnnotationTag.tag_id,
            )
        )

        if self.key is None:
            subquery = subquery.where(models.Tag.value == self.value)
        elif self.value is None:
            subquery = subquery.where(models.Tag.key == self.key)
        else:
            subquery = subquery.where(
                tuple_(models.Tag.key, models.Tag.value)
                == (self.key, self.value)
            )

        subquery = subquery.distinct(models.SoundEventAnnotation.id)
        return query.where(models.SoundEventAnnotation.id.in_(subquery))


SoundEventAnnotationFilter = base.combine(
    project=ProjectFilter,
    recording=RecordingFilter,
    sound_event=SoundEventFilter,
    created_by=CreatedByFilter,
    task=ClipAnnotationFilter,
    tag=TagFilter,
    created_on=CreatedOnFilter,
)
