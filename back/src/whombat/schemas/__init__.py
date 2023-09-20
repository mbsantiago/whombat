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

from whombat.schemas.annotation_projects import (
    AnnotationProject,
    AnnotationProjectCreate,
    AnnotationProjectUpdate,
)
from whombat.schemas.annotations import (
    Annotation,
    AnnotationCreate,
    AnnotationPostCreate,
    AnnotationTagCreate,
    AnnotationTag,
    AnnotationNote,
)
from whombat.schemas.audio import AudioParameters
from whombat.schemas.base import Page
from whombat.schemas.clips import Clip, ClipCreate, ClipFeatureCreate
from whombat.schemas.datasets import (
    Dataset,
    DatasetCreate,
    DatasetFile,
    DatasetRecording,
    DatasetRecordingCreate,
    DatasetUpdate,
    DatasetWithCounts,
    FileState,
)
from whombat.schemas.features import (
    Feature,
    FeatureName,
    FeatureNameCreate,
    FeatureNameUpdate,
)
from whombat.schemas.notes import Note, NoteCreate, NotePostCreate, NoteUpdate
from whombat.schemas.recordings import (
    Recording,
    RecordingCreate,
    RecordingNote,
    RecordingPreCreate,
    RecordingTag,
    RecordingUpdate,
    RecordingWithoutPath,
)
from whombat.schemas.sound_events import (
    SoundEvent,
    SoundEventCreate,
    SoundEventFeatureCreate,
    SoundEventUpdate,
)
from whombat.schemas.spectrograms import (
    SpectrogramParameters,
    STFTParameters,
    AmplitudeParameters,
    Scale,
    Window,
)
from whombat.schemas.tags import Tag, TagCreate, TagUpdate
from whombat.schemas.tasks import (
    Task,
    TaskCreate,
    TaskNote,
    TaskStatusBadge,
    TaskStatusBadgeCreate,
    TaskTag,
    TaskTagCreate,
)
from whombat.schemas.users import SimpleUser, User, UserCreate, UserUpdate

__all__ = [
    "AmplitudeParameters",
    "Annotation",
    "AnnotationCreate",
    "AnnotationNote",
    "AnnotationPostCreate",
    "AnnotationProject",
    "AnnotationProjectCreate",
    "AnnotationProjectUpdate",
    "AnnotationTag",
    "AnnotationTagCreate",
    "AudioParameters",
    "Clip",
    "ClipCreate",
    "ClipFeatureCreate",
    "Dataset",
    "DatasetCreate",
    "DatasetFile",
    "DatasetRecording",
    "DatasetRecordingCreate",
    "DatasetUpdate",
    "DatasetWithCounts",
    "Feature",
    "FeatureName",
    "FeatureNameCreate",
    "FeatureNameUpdate",
    "FileState",
    "Note",
    "NoteCreate",
    "NotePostCreate",
    "NoteUpdate",
    "Page",
    "Recording",
    "RecordingCreate",
    "RecordingNote",
    "RecordingPreCreate",
    "RecordingTag",
    "RecordingUpdate",
    "RecordingWithoutPath",
    "STFTParameters",
    "Scale",
    "SimpleUser",
    "SoundEvent",
    "SoundEventCreate",
    "SoundEventFeatureCreate",
    "SoundEventUpdate",
    "SpectrogramParameters",
    "Tag",
    "TagCreate",
    "TagUpdate",
    "Task",
    "TaskCreate",
    "TaskNote",
    "TaskStatusBadge",
    "TaskStatusBadgeCreate",
    "TaskTag",
    "TaskTagCreate",
    "User",
    "UserCreate",
    "UserUpdate",
    "Window",
]
