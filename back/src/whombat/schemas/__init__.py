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

from whombat.schemas.base import Page
from whombat.schemas.annotation_projects import (
    AnnotationProject,
    AnnotationProjectCreate,
    AnnotationProjectUpdate,
)
from whombat.schemas.annotations import (
    Annotation,
    AnnotationCreate,
    AnnotationTagCreate,
)
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
from whombat.schemas.notes import Note, NoteCreate, NoteUpdate
from whombat.schemas.recordings import (
    Recording,
    RecordingCreate,
    RecordingPreCreate,
    RecordingUpdate,
    RecordingWithoutPath,
)
from whombat.schemas.sound_events import (
    SoundEvent,
    SoundEventCreate,
    SoundEventFeatureCreate,
    SoundEventUpdate,
)
from whombat.schemas.tags import Tag, TagCreate, TagUpdate
from whombat.schemas.tasks import (
    Task,
    TaskCreate,
    TaskStatusBadge,
    TaskStatusBadgeCreate,
    TaskTag,
    TaskTagCreate,
)
from whombat.schemas.users import SimpleUser, User, UserCreate, UserUpdate

__all__ = [
    "Annotation",
    "AnnotationCreate",
    "AnnotationProject",
    "AnnotationProjectCreate",
    "AnnotationProjectUpdate",
    "AnnotationTagCreate",
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
    "NoteUpdate",
    "Page",
    "Recording",
    "RecordingCreate",
    "RecordingPreCreate",
    "RecordingUpdate",
    "RecordingWithoutPath",
    "SimpleUser",
    "SoundEvent",
    "SoundEventCreate",
    "SoundEventFeatureCreate",
    "SoundEventUpdate",
    "Tag",
    "TagCreate",
    "TagUpdate",
    "Task",
    "TaskCreate",
    "TaskStatusBadge",
    "TaskStatusBadgeCreate",
    "TaskTag",
    "TaskTagCreate",
    "User",
    "UserCreate",
    "UserUpdate",
]
