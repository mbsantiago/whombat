"""Task model.

A task is the fundamental unit of annotation work within a project. Each task
represents a specific piece of audio that needs to be annotated according to
the project's criteria. For example, a task could involve identifying all the
vocalizations produced by a certain bird species in a particular recording, or
adding a specific tag to a short audio clip.

Once a task has been assigned to an annotator, they are responsible for
completing the annotation work required by the project criteria. This may
involve listening to the audio clip multiple times, identifying and labeling
specific sound events or audio features, and ensuring that the annotations are
accurate and consistent with the project goals.

Once an annotator has completed a task, they can mark it as finished in the
app. Other users can then review the completed task and add notes or comments
to provide context or raise issues with the existing annotations. This
collaborative approach helps to ensure that the annotations are of high quality
and that any errors or inconsistencies are identified and corrected in a timely
manner.

"""

import enum
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.annotation_project import AnnotationProject
from whombat.models.base import Base
from whombat.models.clip import Clip
from whombat.models.note import Note
from whombat.models.tag import Tag
from whombat.models.user import User

__all__ = [
    "Task",
    "TaskNote",
    "TaskState",
    "TaskTag",
]


class TaskState(enum.Enum):
    """Task state."""

    assigned = "assigned"
    """Task has been assigned to an annotator."""

    completed = "completed"
    """Task has been completed by an annotator."""

    verified = "verified"
    """Task has been verified by a reviewer."""

    rejected = "rejected"
    """Task has been rejected by a reviewer."""


class Task(Base):
    """Task model."""

    __tablename__ = "task"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """Unique identifier of the task."""

    project_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("annotation_project.id"),
        nullable=False,
    )
    """Unique identifier of the annotation project."""

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
    )
    """Unique identifier of the audio clip."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )

    project: orm.Mapped[AnnotationProject] = orm.relationship(init=False)
    """Annotation project to which the task belongs."""

    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        lazy="joined",
    )
    """Audio clip to be annotated."""

    notes: orm.Mapped[list[Note]] = orm.relationship(
        default_factory=list,
        secondary="task_note",
        init=False,
        lazy="joined",
        viewonly=True,
    )
    """Notes associated with the task."""

    task_notes: orm.Mapped[list["TaskNote"]] = orm.relationship(
        init=False,
        back_populates="task",
        default_factory=list,
        cascade="all, delete-orphan",
        lazy="joined",
    )

    tags: orm.Mapped[list["TaskTag"]] = orm.relationship(
        init=False,
        back_populates="task",
        default_factory=list,
        cascade="all, delete-orphan",
        lazy="joined",
    )

    status_badges: orm.Mapped[list["TaskStatusBadge"]] = orm.relationship(
        "TaskStatusBadge",
        back_populates="task",
        cascade="all",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )

    __table_args__ = (UniqueConstraint("project_id", "clip_id"),)


class TaskStatusBadge(Base):
    """Task status badge model."""

    __tablename__ = "task_status_badge"

    id: orm.Mapped[int] = orm.mapped_column(
        primary_key=True,
        init=False,
    )

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
        nullable=False,
    )
    """Unique identifier of the task."""

    user_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=False,
    )
    """Unique ID of the user to whom the status badge refers."""

    state: orm.Mapped[TaskState]
    """Type of status."""

    task: orm.Mapped[Task] = orm.relationship(
        back_populates="status_badges",
        init=False,
    )

    user: orm.Mapped[User] = orm.relationship(
        User,
        init=False,
        lazy="joined",
    )
    """User to whom the status badge refers."""

    __table_args__ = (UniqueConstraint("task_id", "user_id", "state"),)


class TaskNote(Base):
    """Task note model."""

    __tablename__ = "task_note"

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the task."""

    note_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("note.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the note."""

    task: orm.Mapped[Task] = orm.relationship(
        back_populates="task_notes",
        init=False,
        repr=False,
    )

    note: orm.Mapped[Note] = orm.relationship(
        init=False,
        lazy="joined",
    )

    __table_args__ = (UniqueConstraint("task_id", "note_id"),)


class TaskTag(Base):
    """Task tag model."""

    __tablename__ = "task_tag"

    id: orm.Mapped[int] = orm.mapped_column(
        primary_key=True,
        init=False,
    )

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
    )
    """Unique identifier of the task."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
    )
    """Unique identifier of the tag."""

    created_by_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
    )
    """Unique identifier of the user who created the tag."""

    task: orm.Mapped[Task] = orm.relationship(
        back_populates="tags",
        init=False,
        repr=False,
    )

    tag: orm.Mapped[Tag] = orm.relationship(
        init=False,
        lazy="joined",
    )

    created_by: orm.Mapped[User] = orm.relationship(
        init=False,
        lazy="joined",
    )

    __table_args__ = (
        UniqueConstraint(
            "task_id",
            "tag_id",
            "created_by_id",
        ),
    )
