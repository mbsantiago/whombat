"""Schemas for handling Recordings."""

import datetime
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field, FilePath, field_validator

from whombat.core import files
from whombat.schemas.features import Feature
from whombat.schemas.notes import Note
from whombat.schemas.tags import Tag

__all__ = [
    "Recording",
    "RecordingCreate",
    "RecordingUpdate",
]


class Recording(BaseModel):
    """Schema for Recording objects returned to the user."""

    model_config = ConfigDict(from_attributes=True)

    path: Path

    hash: str
    duration: float
    channels: int
    samplerate: int
    time_expansion: float = 1.0

    date: datetime.date | None = None
    time: datetime.time | None = None
    latitude: float | None = None
    longitude: float | None = None

    tags: list[Tag] = Field(default_factory=list)
    features: list[Feature] = Field(default_factory=list)
    notes: list[Note] = Field(default_factory=list)

    def __hash__(self):
        """Hash function."""
        return hash(self.hash)

    @classmethod
    def from_file(cls, path: FilePath):
        """Create a Recording object from a file."""
        info = files.get_file_info(path)
        if (
            not info.exists
            or not info.is_audio
            or info.media_info is None
            or info.hash is None
        ):
            raise ValueError("Not an audio file.")
        return cls(
            path=path,
            hash=info.hash,
            duration=info.media_info.duration_s,
            channels=info.media_info.channels,
            samplerate=info.media_info.samplerate_hz,
        )


class RecordingCreate(BaseModel):
    """Schema for Recording objects created by the user."""

    path: FilePath

    date: datetime.date | None = None
    time: datetime.time | None = None
    latitude: float | None = Field(..., ge=-90, le=90)
    longitude: float | None = Field(..., ge=-180, le=180)
    time_expansion: float = Field(1.0, gt=0)

    @field_validator("path")
    def is_an_audio_file(cls, v):
        """Validate that the given path is an audio file."""
        if not files.is_audio_file(v):
            raise ValueError("Not an audio file.")
        return v


class RecordingUpdate(BaseModel):
    """Schema for Recording objects updated by the user."""

    date: datetime.date | None = None
    time: datetime.time | None = None
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)
    time_expansion: float | None = Field(None, gt=0)
