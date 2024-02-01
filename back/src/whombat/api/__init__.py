"""Python API for Whombat."""

from whombat.api.annotation_projects import annotation_projects
from whombat.api.annotation_tasks import annotation_tasks
from whombat.api.audio import load_audio, load_clip_bytes
from whombat.api.clip_annotations import clip_annotations
from whombat.api.clip_evaluations import clip_evaluations
from whombat.api.clip_predictions import clip_predictions
from whombat.api.clips import clips
from whombat.api.datasets import datasets
from whombat.api.evaluation_sets import evaluation_sets
from whombat.api.evaluations import evaluations
from whombat.api.features import features, find_feature, find_feature_value
from whombat.api.model_runs import model_runs
from whombat.api.notes import notes
from whombat.api.recordings import recordings
from whombat.api.sessions import create_session
from whombat.api.sound_event_annotations import sound_event_annotations
from whombat.api.sound_event_evaluations import sound_event_evaluations
from whombat.api.sound_event_predictions import sound_event_predictions
from whombat.api.sound_events import sound_events
from whombat.api.spectrograms import compute_spectrogram
from whombat.api.tags import find_tag, find_tag_value, tags
from whombat.api.user_runs import user_runs
from whombat.api.users import users

__all__ = [
    "annotation_projects",
    "annotation_tasks",
    "clip_annotations",
    "clip_evaluations",
    "clip_predictions",
    "clips",
    "compute_spectrogram",
    "create_session",
    "datasets",
    "evaluation_sets",
    "evaluations",
    "features",
    "find_feature",
    "find_feature_value",
    "find_tag",
    "find_tag_value",
    "load_audio",
    "load_clip_bytes",
    "model_runs",
    "notes",
    "recordings",
    "sound_event_annotations",
    "sound_event_evaluations",
    "sound_event_predictions",
    "sound_events",
    "tags",
    "user_runs",
    "users",
]
