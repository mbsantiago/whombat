"""Module defining the main database models of whombat.

We are using SQLAlchemy to define our database models. The
models are defined in separate files, and then imported into
this module. This allows us to keep the models organized, and
also allows us to import the models into other modules without
having to import the entire database module.
"""
from whombat.models.annotation import Annotation, AnnotationNote, AnnotationTag
from whombat.models.annotation_project import (
    AnnotationProject,
    AnnotationProjectTag,
)
from whombat.models.base import Base
from whombat.models.clip import Clip, ClipFeature, ClipTag
from whombat.models.clip_prediction import (
    ClipPrediction,
    ClipPredictionNote,
    ClipPredictionTag,
)
from whombat.models.dataset import Dataset, DatasetRecording
from whombat.models.clip_evaluation import ClipEvaluation
from whombat.models.evaluated_sound_event import EvaluatedSoundEvent
from whombat.models.evaluation import Evaluation
from whombat.models.evaluation_set import EvaluationSet, EvaluationSetTag
from whombat.models.evaluation_task import EvaluationTask
from whombat.models.feature import FeatureName
from whombat.models.note import Note
from whombat.models.prediction_run import PredictionRun, PredictionRunNote
from whombat.models.recording import (
    Recording,
    RecordingFeature,
    RecordingNote,
    RecordingTag,
)
from whombat.models.sound_event import (
    SoundEvent,
    SoundEventFeature,
    SoundEventTag,
)
from whombat.models.sound_event_prediction import (
    SoundEventPrediction,
    SoundEventPredictionTag,
)
from whombat.models.tag import Tag
from whombat.models.task import (
    Task,
    TaskNote,
    TaskState,
    TaskStatusBadge,
    TaskTag,
)
from whombat.models.token import AccessToken
from whombat.models.user import User

__all__ = [
    "AccessToken",
    "Annotation",
    "AnnotationNote",
    "AnnotationProject",
    "AnnotationProjectTag",
    "AnnotationTag",
    "Base",
    "Clip",
    "ClipFeature",
    "ClipPrediction",
    "ClipPredictionNote",
    "ClipPredictionTag",
    "ClipTag",
    "Dataset",
    "DatasetRecording",
    "ClipEvaluation",
    "EvaluatedSoundEvent",
    "Evaluation",
    "EvaluationSet",
    "EvaluationSetTag",
    "EvaluationTask",
    "FeatureName",
    "Note",
    "PredictionRun",
    "PredictionRunNote",
    "Recording",
    "RecordingFeature",
    "RecordingNote",
    "RecordingTag",
    "SoundEvent",
    "SoundEventFeature",
    "SoundEventPrediction",
    "SoundEventPredictionTag",
    "SoundEventTag",
    "Tag",
    "Task",
    "TaskNote",
    "TaskState",
    "TaskStatusBadge",
    "TaskTag",
    "User",
]
