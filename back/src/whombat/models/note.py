"""Note model.

Notes are user messages that can be attached to recordings, clips, or
sound events. They serve as a way to provide additional textual context
or discuss specific aspects of the annotation with other users. Notes
can be added to any item within the annotation project, including
completed tasks or individual sound events.

Users can mark notes as an issue to flag incomplete or incorrect
annotations or to indicate that a specific item needs attention from
other users. When a note is marked as an issue, it becomes more visible
to other annotators and can be easily accessed through the project
interface.

Notes can be particularly useful for providing context or explanations
about specific annotations, or for discussing alternative
interpretations of the same sound event. Additionally, they can be used
to provide feedback to other users or to ask for clarification about
specific annotations.
"""

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey

from whombat.models.base import Base
from whombat.models.user import User

__all__ = [
    "Note",
]


class Note(Base):
    """Note model.

    Attributes
    ----------
    id
        The database id of the note.
    uuid
        The UUID of the note.
    message
        Textual message of the note.
    is_issue
        Whether the note is an issue.
    created_by
        The user who created the note.
    created_on
        The date and time when the note was created.

    Parameters
    ----------
    message : str
        Textual message of the note.
    is_issue : bool, optional
        Whether the note is an issue. Defaults to False.
    created_by_id : int, optional
        The database id of the user who created the note.
    uuid : UUID, optional
        The UUID of the note.
    """

    __tablename__ = "note"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    message: orm.Mapped[str] = orm.mapped_column(nullable=False)
    created_by_id: orm.Mapped[UUID] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=True,
    )
    is_issue: orm.Mapped[bool] = orm.mapped_column(
        nullable=False,
        default=False,
    )
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    created_by: orm.Mapped[User] = orm.relationship(
        User,
        back_populates="notes",
        lazy="joined",
        init=False,
    )

    # ========================================================================
    # Relationships (backrefs)

    if TYPE_CHECKING:
        from whombat.models.clip_annotation import (
            ClipAnnotation,
            ClipAnnotationNote,
        )
        from whombat.models.recording import Recording, RecordingNote
        from whombat.models.sound_event_annotation import (
            SoundEventAnnotation,
            SoundEventAnnotationNote,
        )

    recording: orm.Mapped[Optional["Recording"]] = orm.relationship(
        "Recording",
        secondary="recording_note",
        init=False,
        repr=False,
        viewonly=True,
        back_populates="notes",
    )

    recording_note: orm.Mapped[Optional["RecordingNote"]] = orm.relationship(
        "RecordingNote",
        init=False,
        repr=False,
        back_populates="note",
        single_parent=True,
        cascade="all, delete-orphan",
    )

    sound_event_annotation: orm.Mapped[Optional["SoundEventAnnotation"]] = (
        orm.relationship(
            "SoundEventAnnotation",
            secondary="sound_event_annotation_note",
            init=False,
            repr=False,
            viewonly=True,
            back_populates="notes",
        )
    )

    sound_event_annotation_note: orm.Mapped[
        Optional["SoundEventAnnotationNote"]
    ] = orm.relationship(
        "SoundEventAnnotationNote",
        init=False,
        repr=False,
        back_populates="note",
        single_parent=True,
        cascade="all, delete-orphan",
    )

    clip_annotation: orm.Mapped[Optional["ClipAnnotation"]] = orm.relationship(
        "ClipAnnotation",
        secondary="clip_annotation_note",
        init=False,
        repr=False,
        viewonly=True,
        back_populates="notes",
    )

    clip_annotation_note: orm.Mapped[Optional["ClipAnnotationNote"]] = (
        orm.relationship(
            "ClipAnnotationNote",
            init=False,
            repr=False,
            back_populates="note",
            single_parent=True,
            cascade="all, delete-orphan",
        )
    )
