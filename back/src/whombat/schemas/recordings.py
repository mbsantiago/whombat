"""Schemas for handling Recordings."""

import datetime
from pathlib import Path
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, FilePath, field_validator

from whombat.core import files
from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.notes import Note
from whombat.schemas.tags import Tag

__all__ = [
    "Recording",
    "RecordingCreate",
    "RecordingUpdate",
    "RecordingPreCreate",
    "RecordingWithoutPath",
    "RecordingNote",
]


class RecordingMetadata(BaseSchema):
    """Metadata associated with a recording."""

    uuid: UUID = Field(default_factory=uuid4)
    """The UUID of the recording."""

    date: datetime.date | None = None
    """The date of the recording."""

    time: datetime.time | None = None
    """The time of the recording."""

    latitude: float | None = Field(default=None, ge=-90, le=90)
    """The latitude of the recording."""

    longitude: float | None = Field(default=None, ge=-180, le=180)
    """The longitude of the recording."""

    time_expansion: float = Field(default=1.0, gt=0)
    """The time expansion factor of the recording."""


class RecordingMediaInfo(BaseSchema):
    """Media information associated with a recording."""

    hash: str
    """The md5 hash of the audio file."""

    duration: float
    """The duration of the audio file in seconds.

    This is the duration of the original audio file, not the time expanded
    version. This can vary depending on the time expansion factor. If
    the stored file has a duration of 10 seconds and a time expansion
    factor is 2, this means that the original recording was 5 seconds
    long. So the duration of the original recording is 5 seconds, not 10.
    """

    channels: int
    """The number of channels in the audio file."""

    samplerate: int
    """The sample rate of the audio file in Hz.

    This is the sample rate of the original audio file, not the time
    expanded version. This can vary depending on the time expansion
    factor. If the stored file has a sample rate of 44100 Hz and a time
    expansion factor is 2, this means that the original recording had a
    sample rate of 88200 Hz. So the sample rate of the original
    recording is 88200 Hz, not 44100 Hz.
    """


class RecordingObjects(BaseSchema):
    """Objects associated with a recording."""

    tags: list[Tag] = Field(default_factory=list)
    """The tags associated with the recording."""

    features: list[Feature] = Field(default_factory=list)
    """The features associated with the recording."""

    notes: list[Note] = Field(default_factory=list)
    """The notes associated with the recording."""


class RecordingCreate(RecordingMetadata):
    """Data for Recording creation.

    This only contains data that is provided by the user.
    """

    uuid: UUID = Field(default_factory=uuid4)
    """The UUID of the recording."""

    # NOTE: We use a FilePath object as this will make sure that the path is a
    # valid path and that the file exists.
    path: FilePath
    """The path to the audio file."""

    @field_validator("path")
    def is_an_audio_file(cls, v):
        """Validate that the given path is an audio file."""
        if not files.is_audio_file(v):
            raise ValueError("Not an audio file.")
        return v


class RecordingPreCreate(RecordingMediaInfo, RecordingMetadata):
    """Data for Recording creation.

    This contains data that has also been extracted from the audio file.
    """

    # NOTE: We use a Path object as validation is not required after creation.
    path: Path
    """The path to the audio file."""


class Recording(RecordingObjects, RecordingPreCreate):
    """Schema for Recording objects returned to the user."""

    id: int
    """The database id of the recording."""


class RecordingWithoutPath(RecordingObjects, RecordingPreCreate):
    """Schema for Recording objects returned to the user."""

    id: int
    """The database id of the recording."""


class RecordingUpdate(BaseModel):
    """Schema for Recording objects updated by the user."""

    date: datetime.date | None = None
    """The date of the recording."""

    time: datetime.time | None = None
    """The time of the recording."""

    latitude: float | None = Field(default=None, ge=-90, le=90)
    """The latitude of the recording."""

    longitude: float | None = Field(default=None, ge=-180, le=180)
    """The longitude of the recording."""

    path: FilePath | None = None
    """New path to the audio file."""

    time_expansion: float | None = Field(default=None, gt=0)
    """New time expansion factor of the recording."""



class RecordingNote(BaseSchema):
    """Schema for a Note attached to a Recording."""

    recording_id: int
    """The database id of the Note."""

    note_id: int
    """The database id of the Note."""

    note: Note
    """The Note attached to the Recording."""
