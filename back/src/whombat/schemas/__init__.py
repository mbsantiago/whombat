"""Schemas for Whombat data models.

The Whombat Python API returns these schemas to the user, and
they are the main way that the user interacts with the data.

Schemas are defined using Pydantic, and are used to
validate data before it is inserted into the database, and also to
validate data before it is returned to the user.

Most database models have multiple schemas, a main schema that
is used to return data to the user, and a create and update
schema that is used to validate data before it is inserted into
the database.

"""

from whombat.schemas.clips import Clip, ClipCreate
from whombat.schemas.datasets import (
    Dataset,
    DatasetFile,
    DatasetRecording,
    FileState,
)
from whombat.schemas.features import Feature, FeatureName, FeatureNameCreate
from whombat.schemas.notes import Note, NoteCreate, NoteUpdate
from whombat.schemas.recordings import (
    Recording,
    RecordingCreate,
    RecordingUpdate,
)
from whombat.schemas.sound_events import (
    SoundEvent,
    SoundEventCreate,
)
from whombat.schemas.tags import Tag, TagCreate, TagUpdate
from whombat.schemas.users import User, UserCreate, UserUpdate, SimpleUser

__all__ = [
    "Clip",
    "ClipCreate",
    "Dataset",
    "DatasetFile",
    "DatasetRecording",
    "Feature",
    "FeatureName",
    "FeatureNameCreate",
    "FileState",
    "Note",
    "NoteCreate",
    "NoteUpdate",
    "Recording",
    "RecordingCreate",
    "RecordingUpdate",
    "SimpleUser",
    "SoundEvent",
    "SoundEventCreate",
    "Tag",
    "TagCreate",
    "TagUpdate",
    "User",
    "UserCreate",
    "UserUpdate",
]
