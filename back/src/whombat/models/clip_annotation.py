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
    """Clip Annotation Model.

    Attributes
    ----------
    id
        The database id of the annotation.
    uuid
        The uuid of the annotation.
    sound_events
        The sound events annotated in the clip.
    tags
        The tags attached to the annotation.
    notes
        The notes attached to the annotation.
    clip
        The clip to which the annotation belongs.
    created_on
        The date and time the annotation was created.

    Parameters
    ----------
    clip_id : int
        The database id of the clip to which the annotation belongs.
    uuid : UUID, optional
        The UUID of the annotation.
    """

    __tablename__ = "clip_annotation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
    )

    # Relations
    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        lazy="joined",
    )
    sound_events: orm.Mapped[list[SoundEventAnnotation]] = orm.relationship(
        "SoundEventAnnotation",
        lazy="selectin",
        back_populates="clip_annotation",
        default_factory=list,
        cascade="all, delete-orphan",
        repr=False,
        init=False,
    )
    tags: orm.Mapped[list[Tag]] = orm.relationship(
        secondary="clip_annotation_tag",
        lazy="joined",
        viewonly=True,
        default_factory=list,
        repr=False,
        init=False,
    )
    notes: orm.Mapped[list[Note]] = orm.relationship(
        secondary="clip_annotation_note",
        back_populates="clip_annotation",
        lazy="joined",
        default_factory=list,
        viewonly=True,
        repr=False,
        init=False,
        order_by=Note.created_on.desc(),
    )

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
        cascade="all, delete-orphan",
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
            cascade="all, delete-orphan",
        )
    )


class ClipAnnotationTag(Base):
    """Clip Annotation Tag Model.

    Attributes
    ----------
    id
        The database id of the annotation tag.
    tag
        The tag attached to the annotation.
    created_by
        The user who created the annotation tag.
    created_on
        The date and time the annotation tag was created.

    Parameters
    ----------
    clip_annotation_id : int
        The database id of the annotation to which the annotation tag
        belongs.
    tag_id : int
        The database id of the tag attached to the annotation.
    created_by_id : int
        The database id of the user who created the annotation tag.
    """

    __tablename__ = "clip_annotation_tag"
    __table_args__ = (
        UniqueConstraint(
            "clip_annotation_id",
            "tag_id",
            "created_by_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id")
    )
    tag_id: orm.Mapped[int] = orm.mapped_column(ForeignKey("tag.id"))
    created_by_id: orm.Mapped[Optional[int]] = orm.mapped_column(
        ForeignKey("user.id")
    )

    # Relations
    tag: orm.Mapped[Tag] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    created_by: orm.Mapped[Optional[User]] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        back_populates="clip_annotation_tags",
        init=False,
        repr=False,
    )


class ClipAnnotationNote(Base):
    """Clip Annotation Note Model.

    Attributes
    ----------
    note
        The note attached to the annotation.
    created_on
        The date and time the annotation note was created.

    Parameters
    ----------
    clip_annotation_id : int
        The database id of the annotation to which the annotation note
        belongs.
    note_id : int
        The database id of the note attached to the annotation.
    """

    __tablename__ = "clip_annotation_note"
    __table_args__ = (
        UniqueConstraint(
            "clip_annotation_id",
            "note_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id")
    )
    note_id: orm.Mapped[int] = orm.mapped_column(ForeignKey("note.id"))

    # Relations
    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        back_populates="clip_annotation_notes",
        init=False,
        repr=False,
    )
    note: orm.Mapped[Note] = orm.relationship(
        back_populates="clip_annotation_note",
        init=False,
        repr=False,
        lazy="joined",
    )
