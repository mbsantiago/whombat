"""Annotation Task.

A task is the fundamental unit of annotation work within a project. Each
task represents a specific piece of audio that needs to be annotated
according to the project's criteria. For example, a task could involve
identifying all the vocalizations produced by a certain bird species in
a particular recording, or adding a specific tag to a short audio clip.

Once a task has been assigned to an annotator, they are responsible for
completing the annotation work required by the project criteria. This
may involve listening to the audio clip multiple times, identifying and
labeling specific sound events or audio features, and ensuring that the
annotations are accurate and consistent with the project goals.

Once an annotator has completed a task, they can mark it as finished in
the app. Other users can then review the completed task and add notes or
comments to provide context or raise issues with the existing
annotations. This collaborative approach helps to ensure that the
annotations are of high quality and that any errors or inconsistencies
are identified and corrected in a timely manner.
"""

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from soundevent import data
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.clip import Clip
from whombat.models.clip_annotation import ClipAnnotation
from whombat.models.user import User

if TYPE_CHECKING:
    from whombat.models.annotation_project import AnnotationProject

__all__ = [
    "AnnotationTask",
    "AnnotationStatusBadge",
]


class AnnotationTask(Base):
    """Annotation Task model."""

    __tablename__ = "annotation_task"
    __table_args__ = (UniqueConstraint("annotation_project_id", "clip_id"),)

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the task."""

    annotation_project_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("annotation_project.id"),
        nullable=False,
    )
    """The id of the project to which the task belongs."""

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id", ondelete="RESTRICT"),
        nullable=False,
    )
    """The id of the clip to be annotated."""

    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id"),
        nullable=True,
    )
    """The id of the annotation created for the task."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    """The UUID of the task."""

    # Relationships
    annotation_project: orm.Mapped["AnnotationProject"] = orm.relationship(
        back_populates="annotation_tasks",
        init=False,
        repr=False,
    )
    """The project to which the task belongs."""

    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        repr=False,
    )
    """The clip that needs to be annotated to complete this task."""

    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        back_populates="annotation_task",
        cascade="all, delete-orphan",
        init=False,
        single_parent=True,
    )
    """The annotations of the clip this task pertains to."""

    status_badges: orm.Mapped[list["AnnotationStatusBadge"]] = (
        orm.relationship(
            back_populates="annotation_task",
            cascade="all, delete-orphan",
            lazy="joined",
            init=False,
            repr=False,
            default_factory=list,
        )
    )
    """The status badges associated with the task."""


class AnnotationStatusBadge(Base):
    """Annotation status badge model."""

    __tablename__ = "annotation_status_badge"
    __table_args__ = (
        UniqueConstraint("annotation_task_id", "user_id", "state"),
    )

    id: orm.Mapped[int] = orm.mapped_column(
        primary_key=True,
        init=False,
    )
    """The database id of the status badge."""

    annotation_task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("annotation_task.id"),
        nullable=False,
    )
    """The id of the task to which the status badge belongs."""

    user_id: orm.Mapped[Optional[UUID]] = orm.mapped_column(
        ForeignKey("user.id"),
    )
    """The id of the user to whom the status badge refers."""

    state: orm.Mapped[data.AnnotationState]
    """The state of annotation attached to the badge."""

    # Relationships
    annotation_task: orm.Mapped[AnnotationTask] = orm.relationship(
        back_populates="status_badges",
        init=False,
    )
    """The task to which the status badge belongs."""

    user: orm.Mapped[Optional[User]] = orm.relationship(
        User,
        init=False,
        repr=False,
        lazy="joined",
    )
    """The user to whom the status badge refers."""
