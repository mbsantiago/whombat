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

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.annotation_project import AnnotationProject
from whombat.database.models.base import Base
from whombat.database.models.clip import Clip
from whombat.database.models.note import Note
from whombat.database.models.user import User

__all__ = [
    "Task",
    "TaskNote",
    "TaskTag",
]


class TaskState(enum.Enum):
    """Task state."""

    created = "created"
    """Task has been created."""

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

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
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

    project: orm.Mapped[AnnotationProject] = orm.relationship()
    """Annotation project to which the task belongs."""

    clip: orm.Mapped[Clip] = orm.relationship()
    """Audio clip to be annotated."""

    notes: orm.Mapped[list[Note]] = orm.relationship(
        "Note",
        secondary="task_note",
    )
    """Notes associated with the task."""

    tags: orm.Mapped[list[Note]] = orm.relationship(
        "Tag",
        secondary="task_tag",
    )
    """Tags attached to the clip during the task."""

    completed: orm.Mapped[bool] = orm.mapped_column(
        nullable=False,
        default=False,
    )
    """Whether the task has been completed."""

    status_badges: orm.Mapped[list["TaskStatusBadge"]] = orm.relationship(
        "TaskStatusBadge",
        back_populates="task",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )


class TaskStatusBadge(Base):
    """Task status badge model."""

    __tablename__ = "task_status_badge"

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the task."""

    created_by_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the user associated to the status."""

    task: orm.Mapped[Task] = orm.relationship(
        back_populates="status_badges",
    )

    state: orm.Mapped[TaskState] = orm.mapped_column(
        nullable=False,
    )
    """Type of status."""

    created_by: orm.Mapped[User] = orm.relationship(
        "User",
    )


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

    __table_args__ = (UniqueConstraint("task_id", "note_id"),)


class TaskTag(Base):
    """Task tag model."""

    __tablename__ = "task_tag"

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the task."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the tag."""

    __table_args__ = (UniqueConstraint("task_id", "tag_id"),)
