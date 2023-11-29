"""Annotation model.

Annotations are user created sound events that are attached to audio clips.
They are created by annotators as part of an annotation task and can be used to
identify specific sound events or audio features, such as the presence of a
particular species or the location of a specific sound source.

"""
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.note import Note
from whombat.models.sound_event import SoundEvent
from whombat.models.tag import Tag
from whombat.models.task import Task
from whombat.models.user import User

__all__ = [
    "Annotation",
    "AnnotationNote",
    "AnnotationTag",
]


class Annotation(Base):
    """Annotation model."""

    __tablename__ = "annotation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """Unique identifier of the annotation."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
        nullable=False,
    )
    """Unique identifier of the annotation task."""

    created_by_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=False,
    )
    """Unique identifier of the user who created the annotation."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """Unique identifier of the sound event annotated."""

    task: orm.Mapped[Task] = orm.relationship(
        init=False,
        repr=False,
    )
    """Annotation task to which the annotation belongs."""

    created_by: orm.Mapped[User] = orm.relationship(
        lazy="joined",
        init=False,
        repr=False,
    )
    """User who created the annotation."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship(
        lazy="joined",
        init=False,
        repr=False,
    )
    """Sound event annotated by the annotation."""

    notes: orm.Mapped[list[Note]] = orm.relationship(
        back_populates="annotations",
        secondary="annotation_note",
        lazy="joined",
        init=False,
        repr=False,
        viewonly=True,
        default_factory=list,
    )

    annotation_notes: orm.Mapped[list["AnnotationNote"]] = orm.relationship(
        back_populates="annotation",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )

    tags: orm.Mapped[list["AnnotationTag"]] = orm.relationship(
        back_populates="annotation",
        lazy="joined",
        init=False,
        repr=False,
        cascade="all, delete-orphan",
        default_factory=list,
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

    annotation: orm.Mapped[Annotation] = orm.relationship(
        back_populates="annotation_notes",
        init=False,
        repr=False,
    )

    note: orm.Mapped[Note] = orm.relationship(
        back_populates="annotation_notes",
        lazy="joined",
        init=False,
        repr=False,
    )

    __table_args__ = (UniqueConstraint("annotation_id", "note_id"),)


class AnnotationTag(Base):
    """Annotation tag model."""

    __tablename__ = "annotation_tag"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """Database ID of the annotation tag."""

    annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("annotation.id")
    )
    """Unique identifier of the annotation."""

    tag_id: orm.Mapped[int] = orm.mapped_column(ForeignKey("tag.id"))
    """Unique identifier of the tag."""

    created_by_id: orm.Mapped[int] = orm.mapped_column(ForeignKey("user.id"))
    """ID of the user who created the annotation tag."""

    annotation: orm.Mapped[Annotation] = orm.relationship(
        back_populates="tags",
        init=False,
        repr=False,
    )
    """Annotation to which the annotation tag belongs."""

    tag: orm.Mapped[Tag] = orm.relationship(
        back_populates="annotation_tags",
        lazy="joined",
        init=False,
        repr=False,
    )
    """Tag attached to the annotation."""

    created_by: orm.Mapped[User] = orm.relationship(
        back_populates="annotation_tags",
        lazy="joined",
        init=False,
        repr=False,
    )
    """User who created the annotation tag."""

    __table_args__ = (
        UniqueConstraint("annotation_id", "tag_id", "created_by_id"),
    )
