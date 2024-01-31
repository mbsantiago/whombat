"""Filters for tags."""

from uuid import UUID

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "KeyFilter",
    "ValueFilter",
    "SearchFilter",
    "AnnotationProjectFilter",
    "TagFilter",
]


KeyFilter = base.string_filter(models.Tag.key)
"""Filter tags by key."""

ValueFilter = base.string_filter(models.Tag.value)
"""Filter tags by value."""

SearchFilter = base.search_filter([models.Tag.key, models.Tag.value])
"""Search tags by key or value."""


class AnnotationProjectFilter(base.Filter):
    """Get tags for an annotation project."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by project."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.AnnotationProjectTag,
                models.AnnotationProjectTag.tag_id == models.Tag.id,
            )
            .join(
                models.AnnotationProject,
                models.AnnotationProject.id
                == models.AnnotationProjectTag.annotation_project_id,
            )
            .where(models.AnnotationProject.uuid == self.eq)
        )


class RecordingFilter(base.Filter):
    """Get tags for a recording."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by recording."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.RecordingTag,
                models.RecordingTag.tag_id == models.Tag.id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.RecordingTag.recording_id,
            )
            .where(models.Recording.uuid == self.eq)
        )


class SoundEventAnnotationFilter(base.Filter):
    """Get tags for a sound event annotation."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by sound event annotation."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.SoundEventAnnotationTag,
                models.SoundEventAnnotationTag.tag_id == models.Tag.id,
            )
            .join(
                models.SoundEventAnnotation,
                models.SoundEventAnnotation.id
                == models.SoundEventAnnotationTag.sound_event_annotation_id,
            )
            .where(models.SoundEventAnnotation.uuid == self.eq)
        )


class ClipAnnotationFilter(base.Filter):
    """Get tags for a clip annotation."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by clip annotation."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.ClipAnnotationTag,
                models.ClipAnnotationTag.tag_id == models.Tag.id,
            )
            .join(
                models.ClipAnnotation,
                models.ClipAnnotation.id
                == models.ClipAnnotationTag.clip_annotation_id,
            )
            .where(models.ClipAnnotation.uuid == self.eq)
        )


class SoundEventPredictionFilter(base.Filter):
    """Get tags for a sound event prediction."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by sound event prediction."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.SoundEventPredictionTag,
                models.SoundEventPredictionTag.tag_id == models.Tag.id,
            )
            .join(
                models.SoundEventPrediction,
                models.SoundEventPrediction.id
                == models.SoundEventPredictionTag.sound_event_prediction_id,
            )
            .where(models.SoundEventPrediction.uuid == self.eq)
        )


class ClipPredictionFilter(base.Filter):
    """Get tags for a clip prediction."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by clip prediction."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.ClipPredictionTag,
                models.ClipPredictionTag.tag_id == models.Tag.id,
            )
            .join(
                models.ClipPrediction,
                models.ClipPrediction.id
                == models.ClipPredictionTag.clip_prediction_id,
            )
            .where(models.ClipPrediction.uuid == self.eq)
        )


class EvaluationSetFilter(base.Filter):
    """Get tags for an evaluation set."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by evaluation set."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.EvaluationSetTag,
                models.EvaluationSetTag.tag_id == models.Tag.id,
            )
            .join(
                models.EvaluationSet,
                models.EvaluationSet.id
                == models.EvaluationSetTag.evaluation_set_id,
            )
            .where(models.EvaluationSet.uuid == self.eq)
        )


class DatasetFilter(base.Filter):
    """Get tags of recordings in a dataset."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter tags by dataset."""
        if self.eq is None:
            return query

        return (
            query.join(
                models.RecordingTag,
                models.RecordingTag.tag_id == models.Tag.id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.RecordingTag.recording_id,
            )
            .join(
                models.DatasetRecording,
                models.DatasetRecording.recording_id == models.Recording.id,
            )
            .join(
                models.Dataset,
                models.Dataset.id == models.DatasetRecording.dataset_id,
            )
            .where(models.Dataset.uuid == self.eq)
        )


TagFilter = base.combine(
    SearchFilter,
    key=KeyFilter,
    value=ValueFilter,
    annotation_project=AnnotationProjectFilter,
    recording=RecordingFilter,
    sound_event_annotation=SoundEventAnnotationFilter,
    clip_annotation=ClipAnnotationFilter,
    sound_event_prediction=SoundEventPredictionFilter,
    clip_prediction=ClipPredictionFilter,
    evaluation_set=EvaluationSetFilter,
    dataset=DatasetFilter,
)
