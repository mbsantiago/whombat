"""Module defining the main database models of whombat.

We are using SQLAlchemy to define our database models. The
models are defined in separate files, and then imported into
this module. This allows us to keep the models organized, and
also allows us to import the models into other modules without
having to import the entire database module.
"""
from whombat.database.models.annotation import (
    Annotation,
    AnnotationNote,
    AnnotationTag,
)
from whombat.database.models.annotation_project import (
    AnnotationProject,
    AnnotationProjectTag,
)
from whombat.database.models.base import Base
from whombat.database.models.clip import Clip, ClipFeature, ClipTag
from whombat.database.models.dataset import Dataset, DatasetRecording
from whombat.database.models.evaluated_clip import EvaluatedClip
from whombat.database.models.evaluated_sound_event import EvaluatedSoundEvent
from whombat.database.models.evaluation import Evaluation, EvaluationTag
from whombat.database.models.feature import FeatureName
from whombat.database.models.model_run import ModelRun, ModelRunNote
from whombat.database.models.note import Note
from whombat.database.models.predicted_sound_event import (
    PredictedSoundEvent,
    PredictedSoundEventPredictedTag,
)
from whombat.database.models.processed_clip import (
    ProcessedClip,
    ProcessedClipNote,
    ProcessedClipPredictedTag,
)
from whombat.database.models.recording import (
    Recording,
    RecordingFeature,
    RecordingNote,
    RecordingTag,
)
from whombat.database.models.sound_event import (
    SoundEvent,
    SoundEventFeature,
    SoundEventTag,
)
from whombat.database.models.tag import Tag
from whombat.database.models.task import Task, TaskNote, TaskTag
from whombat.database.models.token import AccessToken
from whombat.database.models.training_guess import (
    TrainingGuess,
    TrainingGuessTags,
)
from whombat.database.models.training_session import TrainingSession
from whombat.database.models.training_set import TrainingSet, TrainingSetTag
from whombat.database.models.training_sound_event import TrainingSoundEvent
from whombat.database.models.user import User, UserManager

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
    "ClipTag",
    "Dataset",
    "DatasetRecording",
    "EvaluatedClip",
    "EvaluatedSoundEvent",
    "Evaluation",
    "EvaluationTag",
    "FeatureName",
    "ModelRun",
    "ModelRunNote",
    "Note",
    "PredictedSoundEvent",
    "PredictedSoundEventPredictedTag",
    "ProcessedClip",
    "ProcessedClipNote",
    "ProcessedClipPredictedTag",
    "Recording",
    "RecordingFeature",
    "RecordingNote",
    "RecordingTag",
    "SoundEvent",
    "SoundEventFeature",
    "SoundEventTag",
    "Tag",
    "Task",
    "TaskNote",
    "TaskTag",
    "TrainingGuess",
    "TrainingGuessTags",
    "TrainingSession",
    "TrainingSet",
    "TrainingSetTag",
    "TrainingSoundEvent",
    "User",
    "UserManager",
]
