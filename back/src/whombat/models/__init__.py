"""Module defining the main database models of whombat.

We are using SQLAlchemy to define our database models. The models are
defined in separate files, and then imported into this module. This
allows us to keep the models organized, and also allows us to import the
models into other modules without having to import the entire database
module.
"""

from whombat.models.annotation_project import (
    AnnotationProject,
    AnnotationProjectTag,
)
from whombat.models.annotation_task import (
    AnnotationStatusBadge,
    AnnotationTask,
)
from whombat.models.base import Base
from whombat.models.clip import Clip, ClipFeature
from whombat.models.clip_annotation import (
    ClipAnnotation,
    ClipAnnotationNote,
    ClipAnnotationTag,
)
from whombat.models.clip_evaluation import ClipEvaluation, ClipEvaluationMetric
from whombat.models.clip_prediction import ClipPrediction, ClipPredictionTag
from whombat.models.dataset import Dataset, DatasetRecording
from whombat.models.evaluation import Evaluation, EvaluationMetric
from whombat.models.evaluation_set import (
    EvaluationSet,
    EvaluationSetAnnotation,
    EvaluationSetModelRun,
    EvaluationSetTag,
    EvaluationSetUserRun,
)
from whombat.models.feature import FeatureName
from whombat.models.model_run import (
    ModelRun,
    ModelRunEvaluation,
    ModelRunPrediction,
)
from whombat.models.note import Note
from whombat.models.recording import (
    Recording,
    RecordingFeature,
    RecordingNote,
    RecordingOwner,
    RecordingTag,
)
from whombat.models.sound_event import SoundEvent, SoundEventFeature
from whombat.models.sound_event_annotation import (
    SoundEventAnnotation,
    SoundEventAnnotationNote,
    SoundEventAnnotationTag,
)
from whombat.models.sound_event_evaluation import (
    SoundEventEvaluation,
    SoundEventEvaluationMetric,
)
from whombat.models.sound_event_prediction import (
    SoundEventPrediction,
    SoundEventPredictionTag,
)
from whombat.models.tag import Tag
from whombat.models.token import AccessToken
from whombat.models.user import User
from whombat.models.user_run import (
    UserRun,
    UserRunEvaluation,
    UserRunPrediction,
)

__all__ = [
    "AccessToken",
    "AnnotationProject",
    "AnnotationProjectTag",
    "AnnotationStatusBadge",
    "AnnotationTask",
    "Base",
    "Clip",
    "ClipAnnotation",
    "ClipAnnotationNote",
    "ClipAnnotationTag",
    "ClipEvaluation",
    "ClipEvaluationMetric",
    "ClipFeature",
    "ClipPrediction",
    "ClipPredictionTag",
    "Dataset",
    "DatasetRecording",
    "Evaluation",
    "EvaluationMetric",
    "EvaluationSet",
    "EvaluationSetAnnotation",
    "EvaluationSetModelRun",
    "EvaluationSetTag",
    "EvaluationSetUserRun",
    "FeatureName",
    "ModelRun",
    "ModelRunEvaluation",
    "ModelRunPrediction",
    "Note",
    "Recording",
    "RecordingFeature",
    "RecordingNote",
    "RecordingOwner",
    "RecordingTag",
    "SoundEvent",
    "SoundEventAnnotation",
    "SoundEventAnnotationNote",
    "SoundEventAnnotationTag",
    "SoundEventEvaluation",
    "SoundEventEvaluationMetric",
    "SoundEventFeature",
    "SoundEventPrediction",
    "SoundEventPredictionTag",
    "Tag",
    "User",
    "UserRun",
    "UserRunEvaluation",
    "UserRunPrediction",
]
