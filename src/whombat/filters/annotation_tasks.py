"""Filters for Annotation Tasks."""
from uuid import UUID

from sqlalchemy import Select, select

from soundevent import data
from whombat import models
from whombat.filters import base

__all__ = [
    "ProjectFilter",
    "DatasetFilter",
    "TaskFilter",
]


class RecordingTagFilter(base.Filter):
    """Filter for tasks by recording tag."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is None:
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
                models.RecordingTag,
                models.RecordingTag.recording_id == models.Recording.id,
            )
            .where(
                models.RecordingTag.tag_id == self.eq,
            )
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


class ProjectFilter(base.Filter):
    """Filter for tasks by project."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if self.eq is not None:
            query = query.where(
                models.AnnotationTask.annotation_project_id == self.eq
            )

        return query


class DatasetFilter(base.Filter):
    """Filter for tasks by dataset."""

    eq: int | None = None

    def filter(self, query: Select) -> Select:
        """Filter the query."""
        if not self.eq:
            return query

        subquery = (
            select(models.Clip.id)
            .join(
                models.Recording,
                models.Recording.id == models.Clip.recording_id,
            )
            .join(
                models.DatasetRecording,
                models.DatasetRecording.recording_id == models.Recording.id,
            )
            .where(models.DatasetRecording.dataset_id == self.eq)
        )

        return query.where(models.AnnotationTask.clip_id.in_(subquery))


TaskFilter = base.combine(
    assigned_to=AssignedToFilter,
    pending=PendingFilter,
    verified=IsVerifiedFilter,
    rejected=IsRejectedFilter,
    assigned=IsAssignedFilter,
    project=ProjectFilter,
    dataset=DatasetFilter,
    recording_tag=RecordingTagFilter,
)
