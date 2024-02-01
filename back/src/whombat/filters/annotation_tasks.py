"""Filters for Annotation Tasks."""

from uuid import UUID

from soundevent import data
from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "AnnotationProjectFilter",
    "DatasetFilter",
    "AnnotationTaskFilter",
]


class RecordingTagFilter(base.Filter):
    """Filter for tasks by recording tag."""

    key: str | None = None
    value: str | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""

        if self.key is None and self.value is None:
            return query

        query = (
            query.join(
                models.Clip,
                models.Clip.id == models.AnnotationTask.clip_id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.Clip.recording_id,
            )
            .join(
                models.RecordingTag,
                models.RecordingTag.recording_id == models.Recording.id,
            )
            .join(
                models.Tag,
                models.Tag.id == models.RecordingTag.tag_id,
            )
        )

        if self.key is None:
            return query.where(
                models.Tag.value == self.value,
            )

        if self.value is None:
            return query.where(
                models.Tag.key == self.key,
            )

        return query.where(
            models.Tag.key == self.key,
            models.Tag.value == self.value,
        )


class PendingFilter(base.Filter):
    """Filter for annotation tasks if pending."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return query.where(
            models.AnnotationTask.status_badges.any(
                models.AnnotationStatusBadge.state
                == data.AnnotationState.completed,
            )
            != self.eq,
        )


class IsVerifiedFilter(base.Filter):
    """Filter for tasks if verified."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return query.where(
            models.AnnotationTask.status_badges.any(
                models.AnnotationStatusBadge.state
                == data.AnnotationState.verified,
            )
            == self.eq,
        )


class IsRejectedFilter(base.Filter):
    """Filter for tasks if rejected."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return query.where(
            models.AnnotationTask.status_badges.any(
                models.AnnotationStatusBadge.state
                == data.AnnotationState.rejected,
            )
            == self.eq,
        )


class IsAssignedFilter(base.Filter):
    """Filter for tasks if assigned."""

    eq: bool | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return query.where(
            models.AnnotationTask.status_badges.any(
                models.AnnotationStatusBadge.state
                == data.AnnotationState.assigned,
            )
            == self.eq,
        )


class AssignedToFilter(base.Filter):
    """Filter for tasks by assigned user."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return query.join(
            models.AnnotationStatusBadge,
        ).where(
            models.AnnotationStatusBadge.state
            == data.AnnotationState.assigned,
            models.AnnotationStatusBadge.user_id == self.eq,
        )


class AnnotationProjectFilter(base.Filter):
    """Filter for tasks by project."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
            return query

        return query.join(
            models.AnnotationProject,
            models.AnnotationProject.id
            == models.AnnotationTask.annotation_project_id,
        ).where(
            models.AnnotationProject.uuid == self.eq,
        )


class DatasetFilter(base.Filter):
    """Filter for tasks by dataset."""

    eq: UUID | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        return (
            query.join(
                models.Clip,
                models.Clip.id == models.AnnotationTask.clip_id,
            )
            .join(
                models.Recording,
                models.Recording.id == models.Clip.recording_id,
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


AnnotationTaskFilter = base.combine(
    assigned_to=AssignedToFilter,
    pending=PendingFilter,
    verified=IsVerifiedFilter,
    rejected=IsRejectedFilter,
    assigned=IsAssignedFilter,
    annotation_project=AnnotationProjectFilter,
    dataset=DatasetFilter,
    recording_tag=RecordingTagFilter,
)
