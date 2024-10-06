"""Filtersets for the API.

This module defines the ways in which the API can filter the data it
returns and provides some helper functions for the filtersets.
"""

from whombat.filters.annotation_projects import AnnotationProjectFilter
from whombat.filters.annotation_tasks import AnnotationTaskFilter
from whombat.filters.base import Filter
from whombat.filters.clip_annotation_notes import ClipAnnotationNoteFilter
from whombat.filters.clip_annotation_tags import ClipAnnotationTagFilter
from whombat.filters.clip_annotations import ClipAnnotationFilter
from whombat.filters.clip_evaluations import ClipEvaluationFilter
from whombat.filters.clip_predictions import ClipPredictionFilter
from whombat.filters.clips import ClipFilter
from whombat.filters.datasets import DatasetFilter
from whombat.filters.evaluation_sets import EvaluationSetFilter
from whombat.filters.evaluations import EvaluationFilter
from whombat.filters.feature_names import FeatureNameFilter
from whombat.filters.model_runs import ModelRunFilter
from whombat.filters.notes import NoteFilter
from whombat.filters.recording_notes import RecordingNoteFilter
from whombat.filters.recording_tags import RecordingTagFilter
from whombat.filters.recordings import RecordingFilter
from whombat.filters.sound_event_annotation_notes import (
    SoundEventAnnotationNoteFilter,
)
from whombat.filters.sound_event_annotation_tags import (
    SoundEventAnnotationTagFilter,
)
from whombat.filters.sound_event_annotations import SoundEventAnnotationFilter
from whombat.filters.sound_event_evaluations import SoundEventEvaluationFilter
from whombat.filters.sound_event_predictions import SoundEventPredictionFilter
from whombat.filters.sound_events import SoundEventFilter
from whombat.filters.tags import TagFilter
from whombat.filters.user_runs import UserRunFilter

__all__ = [
    "AnnotationProjectFilter",
    "AnnotationTaskFilter",
    "ClipAnnotationFilter",
    "ClipAnnotationNoteFilter",
    "ClipAnnotationTagFilter",
    "ClipEvaluationFilter",
    "ClipPredictionFilter",
    "ClipFilter",
    "DatasetFilter",
    "EvaluationSetFilter",
    "EvaluationFilter",
    "FeatureNameFilter",
    "Filter",
    "ModelRunFilter",
    "NoteFilter",
    "RecordingFilter",
    "RecordingNoteFilter",
    "RecordingTagFilter",
    "SoundEventAnnotationFilter",
    "SoundEventAnnotationNoteFilter",
    "SoundEventAnnotationTagFilter",
    "SoundEventEvaluationFilter",
    "SoundEventPredictionFilter",
    "SoundEventFilter",
    "TagFilter",
    "UserRunFilter",
]
