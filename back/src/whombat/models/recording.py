"""Recording model.

A recording is the primary source of data in the app, representing a
single audio file. Currently, the app supports only WAV files, although
support for additional file formats may be added in the future.
Recordings are part of a dataset, and each recording has a unique
identifier (hash) and a path that points to the audio file relative to
the dataset root directory.

When a recording is registered, its metadata is scanned and retrieved,
and this information is stored within the app. This metadata includes
the duration of the recording, its sample rate, and the number of
channels. Additionally, recordings can optionally include date and time
information to indicate when they were recorded, as well as latitude and
longitude coordinates to indicate where they were recorded.
"""

import datetime
from pathlib import Path
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy

from whombat.models.base import Base
from whombat.models.feature import FeatureName
from whombat.models.note import Note
from whombat.models.tag import Tag
from whombat.models.user import User

if TYPE_CHECKING:
    from whombat.models.clip import Clip
    from whombat.models.dataset import DatasetRecording

__all__ = [
    "Recording",
    "RecordingNote",
    "RecordingTag",
    "RecordingFeature",
]


class Recording(Base):
    """Recording model for recording table.

    This model represents the recording table in the database. It contains the
    all the information about a recording.

    Attributes
    ----------
    id
        The database id of the recording.
    uuid
        The UUID of the recording.
    hash
        The md5 hash of the recording.
    path
        The path of the dataset, relative to the base audio directory.
    duration
        The duration of the recording in seconds.
    samplerate
        The samplerate of the recording in Hz.
    channels
        The number of channels of the recording.
    date
        The date at which the recording was made.
    time
        The time at which the recording was made.
    latitude
        The latitude of the recording site.
    longitude
        The longitude of the recording site.
    time_expansion
        The time expansion factor of the recording.
    rights
        A string describing the usage rights of the recording.
    notes
        A list of notes associated with the recording.
    tags
        A list of tags associated with the recording.
    features
        A list of features associated with the recording.
    owners
        The list of users who have ownership over the recording.

    Parameters
    ----------
    path : Path
        The path to the recording file relative to the base audio directory.
    hash : str, optional
        The md5 hash of the recording. If not provided, it is computed from the
        recording file.
    duration : float
        The duration of the recording in seconds.
    samplerate : int
        The samplerate of the recording in Hz.
    channels : int
        The number of channels of the recording.
    date : datetime.date, optional
        The date at which the recording was made.
    time : datetime.time, optional
        The time at which the recording was made.
    latitude : float, optional
        The latitude of the recording site.
    longitude : float, optional
        The longitude of the recording site.
    time_expansion : float, optional
        The time expansion factor of the recording. Defaults to 1.0.
    rights : str, optional
        A string describing the usage rights of the recording.

    Notes
    -----
    If the time expansion factor is not 1.0, the duration and samplerate are
    the duration and samplerate of original recording, not the expanded
    recording.

    The path of the dataset is the path to the recording file relative to the
    base audio directory. We dont store the absolute path to the recording file
    in the database, as this may expose sensitive information, and it makes it
    easier to share datasets between users.

    The hash of the recording is used to uniquely identify it. It is computed
    from the recording file, and is used to check if a recording has already
    been registered in the database. If the hash of a recording is already in
    the database, the recording is not registered again.
    """

    __tablename__ = "recording"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4, kw_only=True, unique=True
    )
    hash: orm.Mapped[str] = orm.mapped_column(unique=True, index=True)
    path: orm.Mapped[Path] = orm.mapped_column(unique=True, index=True)
    duration: orm.Mapped[float]
    samplerate: orm.Mapped[int]
    channels: orm.Mapped[int]
    date: orm.Mapped[datetime.date | None] = orm.mapped_column(default=None)
    time: orm.Mapped[datetime.time | None] = orm.mapped_column(default=None)
    latitude: orm.Mapped[float | None] = orm.mapped_column(default=None)
    longitude: orm.Mapped[float | None] = orm.mapped_column(default=None)
    time_expansion: orm.Mapped[float] = orm.mapped_column(default=1.0)
    rights: orm.Mapped[str | None] = orm.mapped_column(default=None)

    # Relationships
    notes: orm.Mapped[list[Note]] = orm.relationship(
        Note,
        secondary="recording_note",
        lazy="joined",
        viewonly=True,
        back_populates="recording",
        default_factory=list,
        order_by=Note.created_on.desc(),
    )
    tags: orm.Mapped[list[Tag]] = orm.relationship(
        lazy="joined",
        viewonly=True,
        secondary="recording_tag",
        back_populates="recordings",
        default_factory=list,
    )
    features: orm.Mapped[list["RecordingFeature"]] = orm.relationship(
        lazy="joined",
        back_populates="recording",
        default_factory=list,
        cascade="all, delete-orphan",
    )
    owners: orm.Mapped[list[User]] = orm.relationship(
        lazy="joined",
        viewonly=True,
        secondary="recording_owner",
        back_populates="recordings",
        default_factory=list,
    )

    # Secondary relationships
    recording_notes: orm.Mapped[list["RecordingNote"]] = orm.relationship(
        lazy="joined",
        cascade="all, delete-orphan",
        back_populates="recording",
        default_factory=list,
    )
    recording_tags: orm.Mapped[list["RecordingTag"]] = orm.relationship(
        cascade="all, delete-orphan",
        back_populates="recording",
        default_factory=list,
    )
    recording_owners: orm.Mapped[list["RecordingOwner"]] = orm.relationship(
        lazy="joined",
        cascade="all, delete-orphan",
        back_populates="recording",
        default_factory=list,
    )

    # Backrefs
    clips: orm.Mapped[list["Clip"]] = orm.relationship(
        back_populates="recording",
        default_factory=list,
        init=False,
        cascade="all, delete-orphan",
        repr=False,
    )
    recording_datasets: orm.Mapped[list["DatasetRecording"]] = (
        orm.relationship(
            init=False,
            repr=False,
            cascade="all, delete-orphan",
            back_populates="recording",
            default_factory=list,
        )
    )


class RecordingNote(Base):
    """Recording Note Model.

    Attributes
    ----------
    note
        The note associated with the recording.
    created_on
        The date and time at which the note was created.

    Parameters
    ----------
    recording_id : int
        The database id of the recording to which the note belongs.
    note_id : int
        The database id of the note.
    """

    __tablename__ = "recording_note"
    __table_args__ = (UniqueConstraint("recording_id", "note_id"),)

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
        primary_key=True,
    )
    note_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("note.id"),
        nullable=False,
        primary_key=True,
    )
    recording: orm.Mapped[Recording] = orm.relationship(
        back_populates="recording_notes",
        init=False,
        repr=False,
    )
    note: orm.Mapped[Note] = orm.relationship(
        back_populates="recording_note",
        init=False,
        repr=False,
        lazy="joined",
    )


class RecordingTag(Base):
    """Recording Tag Model.

    Attributes
    ----------
    tag
        The tag associated with the recording.
    created_on
        The date and time at which the tag was created.

    Parameters
    ----------
    recording_id : int
        The database id of the recording to which the tag belongs.
    tag_id : int
        The database id of the tag.
    """

    __tablename__ = "recording_tag"
    __table_args__ = (UniqueConstraint("recording_id", "tag_id"),)

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
        primary_key=True,
    )
    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
        primary_key=True,
    )
    recording: orm.Mapped[Recording] = orm.relationship(
        back_populates="recording_tags",
        init=False,
        repr=False,
    )
    tag: orm.Mapped[Tag] = orm.relationship(
        back_populates="recording_tags",
        init=False,
        repr=False,
        lazy="joined",
    )
    recording_uuid: AssociationProxy[UUID] = association_proxy(
        "recording",
        "uuid",
        init=False,
    )


class RecordingFeature(Base):
    """Recording Feature Model.

    Attributes
    ----------
    feature_name
        The name of the feature.
    value
        The value of the feature.
    created_on
        The date and time at which the feature was created.

    Parameters
    ----------
    recording_id : int
        The database id of the recording to which the feature belongs.
    feature_name_id : int
        The database id of the feature name.
    value : float
        The value of the feature.
    """

    __tablename__ = "recording_feature"
    __table_args__ = (
        UniqueConstraint(
            "recording_id",
            "feature_name_id",
        ),
    )

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
        primary_key=True,
    )
    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id", ondelete="CASCADE"),
        nullable=False,
        primary_key=True,
    )
    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    name: AssociationProxy[str] = association_proxy(
        "feature_name",
        "name",
        init=False,
    )

    # Relationships
    recording: orm.Mapped[Recording] = orm.relationship(
        back_populates="features",
        init=False,
        repr=False,
        cascade="all",
    )
    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        back_populates="recordings",
        init=False,
        repr=False,
        lazy="joined",
    )


class RecordingOwner(Base):
    """RecordingOwner model for recording_owner table.

    Attributes
    ----------
    user
        The user who owns the recording.
    created_on
        The date and time at which the user became the owner of the recording.

    Parameters
    ----------
    recording_id : int
        The database id of the recording.
    user_id : int
        The database id of the user.
    """

    __tablename__ = "recording_owner"
    __table_args__ = (UniqueConstraint("recording_id", "user_id"),)

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
        primary_key=True,
    )
    user_id: orm.Mapped[UUID] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=False,
        primary_key=True,
    )
    recording: orm.Mapped[Recording] = orm.relationship(
        back_populates="recording_owners",
        init=False,
        repr=False,
        cascade="all",
    )
    user: orm.Mapped[User] = orm.relationship(
        back_populates="recording_owner",
        init=False,
        repr=False,
        lazy="joined",
    )
