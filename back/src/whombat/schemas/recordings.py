"""Schemas for handling Recordings."""

from uuid import UUID, uuid4
import datetime
from pathlib import Path

from pydantic import Field, FilePath, field_validator

from whombat.core import files
from whombat.schemas.base import BaseSchema
from whombat.schemas.features import Feature
from whombat.schemas.notes import Note
from whombat.schemas.tags import Tag

__all__ = [
    "Recording",
    "RecordingCreate",
    "RecordingUpdate",
]


class RecordingCreate(BaseSchema):
    """Schema for Recording objects created by the user."""

    path: FilePath
    """The path to the audio file."""

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

    @field_validator("path")
    def is_an_audio_file(cls, v):
        """Validate that the given path is an audio file."""
        if not files.is_audio_file(v):
            raise ValueError("Not an audio file.")
        return v


class Recording(RecordingCreate):
    """Schema for Recording objects returned to the user."""

    path: Path
    id: int

    hash: str
    duration: float
    channels: int
    samplerate: int
    time_expansion: float = 1.0

    tags: list[Tag] = Field(default_factory=list)
    features: list[Feature] = Field(default_factory=list)
    notes: list[Note] = Field(default_factory=list)

    def __hash__(self):
        """Hash function."""
        return hash(self.hash)


class RecordingUpdate(BaseSchema):
    """Schema for Recording objects updated by the user."""

    path: FilePath | None = None
    date: datetime.date | None = None
    time: datetime.time | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    time_expansion: float | None = Field(default=None, gt=0)
