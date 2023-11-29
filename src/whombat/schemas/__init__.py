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
    AnnotationProjectTagCreate,
    AnnotationProjectUpdate,
)
from whombat.schemas.annotations import (
    Annotation,
    AnnotationCreate,
    AnnotationNote,
    AnnotationPostCreate,
    AnnotationTag,
    AnnotationTagCreate,
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
from whombat.schemas.evaluation_sets import (
    EvaluationSet,
    EvaluationSetCreate,
    EvaluationSetUpdate,
)
from whombat.schemas.evaluation_tasks import (
    EvaluationTask,
    EvaluationTaskCreate,
)
from whombat.schemas.evaluations import (
    Evaluation,
    EvaluationCreate,
    EvaluationMetric,
    EvaluationMetricCreate,
    EvaluationMetricUpdate,
    EvaluationUpdate,
)
from whombat.schemas.features import (
    Feature,
    FeatureName,
    FeatureNameCreate,
    FeatureNameUpdate,
)
from whombat.schemas.notes import Note, NoteCreate, NotePostCreate, NoteUpdate
from whombat.schemas.prediction_runs import (
    PredictionRun,
    PredictionRunCreate,
    PredictionRunUpdate,
)
from whombat.schemas.recordings import (
    Recording,
    RecordingCreate,
    RecordingFeatureCreate,
    RecordingNote,
    RecordingPreCreate,
    RecordingTag,
    RecordingTagCreate,
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
    AmplitudeParameters,
    Scale,
    SpectrogramParameters,
    STFTParameters,
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
    "Evaluation",
    "EvaluationCreate",
    "EvaluationMetric",
    "EvaluationMetricCreate",
    "EvaluationMetricUpdate",
    "EvaluationSet",
    "EvaluationSetCreate",
    "EvaluationSetUpdate",
    "EvaluationTask",
    "EvaluationTaskCreate",
    "EvaluationUpdate",
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
    "PredictionRun",
    "PredictionRunCreate",
    "PredictionRunUpdate",
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
    "RecordingTagCreate",
    "RecordingFeatureCreate",
    "AnnotationProjectTagCreate",
]
