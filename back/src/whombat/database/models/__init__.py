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
from whombat.database.models.clip import Clip
from whombat.database.models.dataset import Dataset
from whombat.database.models.model_run import ModelRun, ModelRunNote
from whombat.database.models.note import Note
from whombat.database.models.predicted_sound_event import (
    PredictedSoundEvent,
    PredictedSoundEventPredictedTag,
)
from whombat.database.models.recording import (
    Recording,
    RecordingNote,
    RecordingTag,
)
from whombat.database.models.sound_event import SoundEvent, SoundEventTag
from whombat.database.models.tag import Tag
from whombat.database.models.task import Task, TaskNote, TaskTag
from whombat.database.models.token import AccessToken
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
    "Dataset",
    "ModelRun",
    "ModelRunNote",
    "Note",
    "PredictedSoundEvent",
    "PredictedSoundEventPredictedTag",
    "Recording",
    "RecordingNote",
    "RecordingTag",
    "SoundEvent",
    "SoundEventTag",
    "Tag",
    "Task",
    "TaskNote",
    "TaskTag",
    "User",
    "UserManager",
]
