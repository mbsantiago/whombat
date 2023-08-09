"""Annotation model.

Annotations are user created sound events that are attached to audio clips.
They are created by annotators as part of an annotation task and can be used to
identify specific sound events or audio features, such as the presence of a
particular species or the location of a specific sound source.

"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.base import Base
from whombat.database.models.note import Note
from whombat.database.models.sound_event import SoundEvent
from whombat.database.models.tag import Tag
from whombat.database.models.task import Task
from whombat.database.models.user import User

__all__ = [
    "Annotation",
    "AnnotationNote",
    "AnnotationTag",
]


class Annotation(Base):
    """Annotation model."""

    __tablename__ = "annotation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Unique identifier of the annotation."""

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
        nullable=False,
    )
    """Unique identifier of the annotation task."""

    task: orm.Mapped[Task] = orm.relationship()
    """Annotation task to which the annotation belongs."""

    created_by_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=False,
    )
    """Unique identifier of the user who created the annotation."""

    created_by: orm.Mapped[User] = orm.relationship()
    """User who created the annotation."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """Unique identifier of the sound event annotated."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship()
    """Sound event annotated by the annotation."""

    notes: orm.Mapped[list[Note]] = orm.relationship(
        "Note",
        secondary="annotation_note",
    )

    tags: orm.Mapped[list[Tag]] = orm.relationship(
        "Tag",
        secondary="annotation_tag",
    )


class AnnotationNote(Base):
    """Annotation note model."""

    __tablename__ = "annotation_note"

    annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("annotation.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the annotation."""

    note_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("note.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the note."""

    __table_args__ = (UniqueConstraint("annotation_id", "note_id"),)


class AnnotationTag(Base):
    """Annotation tag model."""

    __tablename__ = "annotation_tag"

    annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("annotation.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the annotation."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the tag."""

    __table_args__ = (UniqueConstraint("annotation_id", "tag_id"),)
