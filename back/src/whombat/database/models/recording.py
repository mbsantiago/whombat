"""Recording model.

A recording is the primary source of data in the app, representing a
single audio file. Currently, the app supports only WAV files, although
support for additional file formats may be added in the future. Recordings
are part of a dataset, and each recording has a unique identifier (UUID)
and a path that points to the audio file relative to the dataset root
directory.

When a recording is registered, its metadata is scanned and retrieved, and
this information is stored within the app. This metadata includes the duration
of the recording, its sample rate, and the number of channels. Additionally,
recordings can optionally include date and time information to indicate when
they were recorded, as well as latitude and longitude coordinates to indicate
where they were recorded.
"""

import datetime
import os
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey

from whombat.database.models.base import Base
from whombat.database.models.dataset import Dataset


class Recording(Base):
    """Recording model for recording table.

    This model represents the recording table in the database. It contains the
    all the information about a recording.

    """

    __tablename__ = "recording"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The id of the recording."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(default=uuid4)
    """The UUID of the recording."""

    dataset_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("dataset.id"),
        nullable=False,
    )
    """The id of the dataset to which the recording belongs."""

    dataset: orm.Mapped[Dataset] = orm.relationship()

    path: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The path to the recording file. 

    This is a relative path to the dataset root directory."""

    duration: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The duration of the recording in seconds."""

    samplerate: orm.Mapped[int] = orm.mapped_column(nullable=False)
    """The samplerate of the recording in Hz."""

    channels: orm.Mapped[int] = orm.mapped_column(nullable=False)
    """The number of channels of the recording."""

    date: orm.Mapped[datetime.date] = orm.mapped_column(nullable=True)
    """The date at which the recording was made."""

    time: orm.Mapped[datetime.time] = orm.mapped_column(nullable=True)
    """The time at which the recording was made."""

    latitude: orm.Mapped[float] = orm.mapped_column(nullable=True)
    """The latitude of the recording site."""

    longitude: orm.Mapped[float] = orm.mapped_column(nullable=True)
    """The longitude of the recording site."""

    @property
    def full_path(self):
        """Get the full path to the recording file."""
        return os.path.join(self.dataset.audio_dir, self.path)

    @property
    def relative_path(self):
        """Get the relative path to the recording file."""
        return os.path.relpath(self.full_path, self.dataset.audio_dir)
