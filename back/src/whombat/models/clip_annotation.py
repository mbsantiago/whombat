"""Clip Annotation Model."""

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.clip import Clip
from whombat.models.note import Note
from whombat.models.sound_event_annotation import SoundEventAnnotation
from whombat.models.tag import Tag
from whombat.models.user import User

if TYPE_CHECKING:
    from whombat.models.annotation_task import AnnotationTask
    from whombat.models.evaluation_set import (
        EvaluationSet,
        EvaluationSetAnnotation,
    )


class ClipAnnotation(Base):
    """Clip Annotation Model."""

    __tablename__ = "clip_annotation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the annotation."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    """The UUID of the annotation."""

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
    )
    """The database id of the clip being annotated."""

    # Relations
    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        lazy="joined",
    )
    """The clip being annotated."""

    sound_events: orm.Mapped[list[SoundEventAnnotation]] = orm.relationship(
        "SoundEventAnnotation",
        lazy="selectin",
        back_populates="clip_annotation",
        default_factory=list,
        cascade="all, delete-orphan",
        repr=False,
        init=False,
    )
    """The sound events annotated in the clip."""

    tags: orm.Mapped[list[Tag]] = orm.relationship(
        secondary="clip_annotation_tag",
        lazy="joined",
        viewonly=True,
        default_factory=list,
        repr=False,
        init=False,
    )
    """The tags attached to the annotation."""

    notes: orm.Mapped[list[Note]] = orm.relationship(
        secondary="clip_annotation_note",
        back_populates="clip_annotation",
        cascade="all, delete-orphan",
        lazy="joined",
        default_factory=list,
        viewonly=True,
        repr=False,
        init=False,
        order_by=Note.created_on.desc(),
    )
    """The notes attached to the annotation."""

    # Secondary relations
    clip_annotation_notes: orm.Mapped[list["ClipAnnotationNote"]] = (
        orm.relationship(
            default_factory=list,
            cascade="all, delete-orphan",
            repr=False,
            init=False,
        )
    )
    clip_annotation_tags: orm.Mapped[list["ClipAnnotationTag"]] = (
        orm.relationship(
            default_factory=list,
            cascade="all, delete-orphan",
            repr=False,
            init=False,
        )
    )

    # Backrefs
    annotation_task: orm.Mapped["AnnotationTask"] = orm.relationship(
        back_populates="clip_annotation",
        init=False,
    )

    evaluation_sets: orm.Mapped[list["EvaluationSet"]] = orm.relationship(
        secondary="evaluation_set_annotation",
        back_populates="clip_annotations",
        init=False,
        repr=False,
        default_factory=list,
        viewonly=True,
    )

    evaluation_set_annotations: orm.Mapped[list["EvaluationSetAnnotation"]] = (
        orm.relationship(
            back_populates="clip_annotation",
            init=False,
            repr=False,
            default_factory=list,
        )
    )


class ClipAnnotationTag(Base):
    """Clip Annotation Tag Model."""

    __tablename__ = "clip_annotation_tag"
    __table_args__ = (
        UniqueConstraint(
            "clip_annotation_id",
            "tag_id",
            "created_by_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the annotation tag."""

    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id")
    )
    """The database id of the annotation to which the tag belongs"""

    tag_id: orm.Mapped[int] = orm.mapped_column(ForeignKey("tag.id"))
    """The database id of the tag attached to the annotation."""

    created_by_id: orm.Mapped[Optional[int]] = orm.mapped_column(
        ForeignKey("user.id")
    )
    """The database id of the user who tagged the annotation."""

    # Relations
    tag: orm.Mapped[Tag] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The tag attached to the annotation."""

    created_by: orm.Mapped[Optional[User]] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The user who tagged the annotation."""

    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        back_populates="clip_annotation_tags",
        init=False,
        repr=False,
    )
    """The annotation being tagged."""


class ClipAnnotationNote(Base):
    """Clip Annotation Note Model."""

    __tablename__ = "clip_annotation_note"
    __table_args__ = (
        UniqueConstraint(
            "clip_annotation_id",
            "note_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the annotation note."""

    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id")
    )
    """The database id of the annotation to which the note belongs."""

    note_id: orm.Mapped[int] = orm.mapped_column(ForeignKey("note.id"))
    """The database id of the note attached to the annotation."""

    # Relations
    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        back_populates="clip_annotation_notes",
        init=False,
        repr=False,
    )
    """The annotation to which the note belongs to."""

    note: orm.Mapped[Note] = orm.relationship(
        back_populates="clip_annotation_note",
        init=False,
        repr=False,
        lazy="joined",
    )
    """The note associated with the annotation."""
