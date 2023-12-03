"""Schemas for Whombat data models.

The Whombat Python API returns these schemas to the user, and they are
the main way that the user interacts with the data.

Schemas are defined using Pydantic, and are used to validate data before
it is inserted into the database, and also to validate data before it is
returned to the user.

Most database models have multiple schemas, a main schema that is used
to return data to the user, and a create and update schema that is used
to validate data before it is inserted into the database.
"""

from whombat.schemas.annotation_projects import (
    AnnotationProject,
    AnnotationProjectCreate,
    AnnotationProjectTagCreate,
    AnnotationProjectUpdate,
)
from whombat.schemas.annotation_tasks import (
    AnnotationTask,
    AnnotationTaskCreate,
    AnnotationTaskStatusBadge,
    AnnotationTaskStatusBadgeCreate,
)
from whombat.schemas.audio import AudioParameters
from whombat.schemas.base import Page
from whombat.schemas.clip_annotations import (
    ClipAnnotation,
    ClipAnnotationCreate,
    ClipAnnotationNote,
    ClipAnnotationNoteCreate,
    ClipAnnotationTag,
    ClipAnnotationTagCreate,
)
from whombat.schemas.clip_evaluations import (
    ClipEvaluation,
    ClipEvaluationCreate,
    ClipEvaluationMetricCreate,
)
from whombat.schemas.clip_predictions import (
    ClipPrediction,
    ClipPredictionCreate,
    ClipPredictionTag,
    ClipPredictionTagCreate,
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
from whombat.schemas.evaluation_sets import (
    EvaluationSet,
    EvaluationSetCreate,
    EvaluationSetUpdate,
)
from whombat.schemas.evaluations import (
    Evaluation,
    EvaluationCreate,
    EvaluationMetric,
    EvaluationMetricCreate,
)
from whombat.schemas.features import (
    Feature,
    FeatureName,
    FeatureNameCreate,
    FeatureNameUpdate,
)
from whombat.schemas.model_runs import ModelRun, ModelRunCreate, ModelRunUpdate
from whombat.schemas.notes import Note, NoteCreate, NotePostCreate, NoteUpdate
from whombat.schemas.plugin import PluginInfo
from whombat.schemas.recordings import (
    Recording,
    RecordingCreate,
    RecordingFeatureCreate,
    RecordingNote,
    RecordingOwner,
    RecordingOwnerCreate,
    RecordingPreCreate,
    RecordingTag,
    RecordingTagCreate,
    RecordingUpdate,
    RecordingWithoutPath,
)
from whombat.schemas.sound_event_annotations import (
    SoundEventAnnotation,
    SoundEventAnnotationCreate,
    SoundEventAnnotationNote,
    SoundEventAnnotationPostCreate,
    SoundEventAnnotationTag,
    SoundEventAnnotationTagCreate,
)
from whombat.schemas.sound_event_evaluations import (
    SoundEventEvaluation,
    SoundEventEvaluationCreate,
    SoundEventEvaluationMetricCreate,
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
from whombat.schemas.user_runs import UserRun, UserRunCreate
from whombat.schemas.users import SimpleUser, User, UserCreate, UserUpdate

__all__ = [
    "AmplitudeParameters",
    "AnnotationProject",
    "AnnotationProjectCreate",
    "AnnotationProjectTagCreate",
    "AnnotationProjectUpdate",
    "AnnotationTask",
    "AnnotationTaskCreate",
    "AnnotationTaskStatusBadge",
    "AnnotationTaskStatusBadgeCreate",
    "AudioParameters",
    "Clip",
    "ClipAnnotation",
    "ClipAnnotationCreate",
    "ClipAnnotationNote",
    "ClipAnnotationNoteCreate",
    "ClipAnnotationTag",
    "ClipAnnotationTagCreate",
    "ClipCreate",
    "ClipEvaluation",
    "ClipEvaluationCreate",
    "ClipEvaluationMetricCreate",
    "ClipFeatureCreate",
    "ClipPrediction",
    "ClipPredictionCreate",
    "ClipPredictionTag",
    "ClipPredictionTagCreate",
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
    "EvaluationSet",
    "EvaluationSetCreate",
    "EvaluationSetUpdate",
    "Feature",
    "FeatureName",
    "FeatureNameCreate",
    "FeatureNameUpdate",
    "FileState",
    "ModelRun",
    "ModelRunCreate",
    "ModelRunUpdate",
    "Note",
    "NoteCreate",
    "NotePostCreate",
    "NoteUpdate",
    "Page",
    "PluginInfo",
    "Recording",
    "RecordingCreate",
    "RecordingFeatureCreate",
    "RecordingNote",
    "RecordingOwner",
    "RecordingOwnerCreate",
    "RecordingPreCreate",
    "RecordingTag",
    "RecordingTagCreate",
    "RecordingUpdate",
    "RecordingWithoutPath",
    "STFTParameters",
    "Scale",
    "SimpleUser",
    "SoundEvent",
    "SoundEventAnnotation",
    "SoundEventAnnotationCreate",
    "SoundEventAnnotationNote",
    "SoundEventAnnotationPostCreate",
    "SoundEventAnnotationTag",
    "SoundEventAnnotationTagCreate",
    "SoundEventCreate",
    "SoundEventEvaluation",
    "SoundEventEvaluationCreate",
    "SoundEventEvaluationMetricCreate",
    "SoundEventFeatureCreate",
    "SoundEventUpdate",
    "SpectrogramParameters",
    "Tag",
    "TagCreate",
    "TagUpdate",
    "User",
    "UserCreate",
    "UserRun",
    "UserRunCreate",
    "UserUpdate",
    "Window",
]
