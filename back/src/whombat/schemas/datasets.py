"""Schemas for handling Datasets."""

from enum import Enum
from pathlib import Path
from uuid import UUID, uuid4

from pydantic import DirectoryPath, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.recordings import Recording

__all__ = [
    "Dataset",
    "DatasetRecording",
    "DatasetCreate",
    "DatasetUpdate",
    "FileState",
]


class DatasetCreate(BaseSchema):
    """Schema for Dataset objects created by the user."""

    uuid: UUID = Field(default_factory=uuid4)
    """The unique identifier of the dataset."""

    audio_dir: DirectoryPath
    """The path to the directory containing the audio files."""

    name: str = Field(..., min_length=1)
    """The name of the dataset."""

    description: str | None = Field(None)
    """The description of the dataset."""


class Dataset(DatasetCreate):
    """Schema for Dataset objects returned to the user."""

    id: int | None = None
    """The database id of the dataset."""


class DatasetUpdate(BaseSchema):
    """Schema for Dataset objects updated by the user."""

    audio_dir: DirectoryPath | None = None
    name: str | None = Field(default=None, min_length=1)
    description: str | None = None


class FileState(Enum):
    """The state of a file in a dataset.

    Datasets can contain files that are not registered in the database. This
    can happen if the file was added to the dataset directory after the
    dataset was registered. Additionally, files can be registered in the
    database but missing from the dataset directory. This can happen if the
    file was removed from the dataset directory after the dataset was
    registered.

    The state of a file can be one of the following:

    - ``missing``: The file is not registered in the database and is missing.

    - ``registered``: The file is registered in the database and is present.

    - ``unregistered``: The file is not registered in the database but is
        present in the dataset directory.
    """

    MISSING = "missing"
    """If the recording is registered but the file is missing."""

    REGISTERED = "registered"
    """If the recording is registered and the file is present."""

    UNREGISTERED = "unregistered"
    """If the recording is not registered but the file is present."""


class DatasetFile(BaseSchema):
    path: Path

    state: FileState


class DatasetRecording(BaseSchema):
    """Schema for DatasetRecording objects returned to the user."""

    path: Path

    recording: Recording
