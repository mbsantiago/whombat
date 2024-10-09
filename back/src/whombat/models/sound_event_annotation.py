"""Annotation model."""

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.note import Note
from whombat.models.sound_event import SoundEvent
from whombat.models.tag import Tag
from whombat.models.user import User

if TYPE_CHECKING:
    from whombat.models.clip_annotation import ClipAnnotation


__all__ = [
    "SoundEventAnnotation",
    "SoundEventAnnotationNote",
    "SoundEventAnnotationTag",
]


class SoundEventAnnotation(Base):
    """Sound Event Annotation model."""

    __tablename__ = "sound_event_annotation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the annotation."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    """The UUID of the annotation."""

    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id"),
        nullable=False,
    )
    """The id of the clip annotation to which the annotation belongs."""

    created_by_id: orm.Mapped[Optional[int]] = orm.mapped_column(
        ForeignKey("user.id"),
    )
    """The id of the user who created the annotation."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """The id of the sound event annotated by the annotation."""

    # Relationships
    clip_annotation: orm.Mapped["ClipAnnotation"] = orm.relationship(
        init=False,
        repr=False,
    )
    """The clip annotation to which the annotation belongs."""

    created_by: orm.Mapped[Optional[User]] = orm.relationship(
        lazy="joined",
        init=False,
        repr=False,
    )
    """The user who created the annotation."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship(
        lazy="joined",
        init=False,
        repr=False,
        cascade="all, delete-orphan",
        single_parent=True,
    )
    """The sound event annotated by the annotation."""

    tags: orm.Mapped[list[Tag]] = orm.relationship(
        secondary="sound_event_annotation_tag",
        lazy="joined",
        viewonly=True,
        default_factory=list,
        repr=False,
        init=False,
    )
    """The tags associated with the annotation."""

    notes: orm.Mapped[list[Note]] = orm.relationship(
        back_populates="sound_event_annotation",
        secondary="sound_event_annotation_note",
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        viewonly=True,
        default_factory=list,
        order_by=Note.created_on.desc(),
    )
    """THe notes associated with the annotation."""

    # =====================
    # Secondary relationships
    sound_event_annotation_notes: orm.Mapped[
        list["SoundEventAnnotationNote"]
    ] = orm.relationship(
        back_populates="sound_event_annotation",
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )

    sound_event_annotation_tags: orm.Mapped[
        list["SoundEventAnnotationTag"]
    ] = orm.relationship(
        lazy="joined",
        default_factory=list,
        cascade="all, delete-orphan",
        repr=False,
        init=False,
    )


class SoundEventAnnotationNote(Base):
    """Sound Event Annotation Note Model."""

    __tablename__ = "sound_event_annotation_note"
    __table_args__ = (
        UniqueConstraint("sound_event_annotation_id", "note_id"),
    )

    sound_event_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event_annotation.id"),
        primary_key=True,
        nullable=False,
    )
    """The id of the annotation to which the note belongs."""

    note_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("note.id"),
        primary_key=True,
        nullable=False,
    )
    """The id of the note associated with the annotation."""

    sound_event_annotation: orm.Mapped[SoundEventAnnotation] = (
        orm.relationship(
            back_populates="sound_event_annotation_notes",
            init=False,
            repr=False,
        )
    )
    """The annotation to which the note belongs to."""

    note: orm.Mapped[Note] = orm.relationship(
        back_populates="sound_event_annotation_note",
        lazy="joined",
        init=False,
        repr=False,
    )
    """The note associated with the annotation."""


class SoundEventAnnotationTag(Base):
    """Annotation tag model."""

    __tablename__ = "sound_event_annotation_tag"
    __table_args__ = (
        UniqueConstraint(
            "sound_event_annotation_id", "tag_id", "created_by_id"
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the annotation tag."""

    sound_event_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event_annotation.id"),
        index=True,
    )
    """The id of the annotation to which the annotation tag belongs."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        index=True,
    )
    """The id of the tag attached to the annotation."""

    created_by_id: orm.Mapped[Optional[int]] = orm.mapped_column(
        ForeignKey("user.id"),
        index=True,
    )
    """The id of the user who created the annotation."""

    # Relationships
    sound_event_annotation: orm.Mapped[SoundEventAnnotation] = (
        orm.relationship(
            back_populates="sound_event_annotation_tags",
            init=False,
            repr=False,
        )
    )
    """The annotation to which the annotation tag belongs."""

    tag: orm.Mapped[Tag] = orm.relationship(
        back_populates="sound_event_annotation_tags",
        lazy="joined",
        init=False,
        repr=False,
    )
    """The tag attached to the annotation."""

    created_by: orm.Mapped[Optional[User]] = orm.relationship(
        back_populates="sound_event_annotation_tags",
        lazy="joined",
        init=False,
        repr=False,
    )
    """The user who created the annotation."""
