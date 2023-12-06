"""Python API for Whombat.

This package contains the Python API for Whombat. It is used to interact
with the database and the models of Whombat.

The API is split into submodules, each containing the functions and
classes for a specific part of the database. This allows for a more
structured API and a better overview of the available functions and
classes.

The Python API is used by the routers to interact between the client and
the data, and thus define the behaviour of the REST API. However, the
Python API can also be used directly to interact with the database and
the models. This can be useful if you wish to integrate your annotated
data into your own scripts or applications.
"""
import whombat.api.annotation_projects as annotation_projects
import whombat.api.annotation_tasks as annotation_tasks
import whombat.api.audio as audio
import whombat.api.clip_annotations as clip_annotations
import whombat.api.clip_predictions as clip_predictions
import whombat.api.clips as clips
import whombat.api.common as common
import whombat.api.datasets as datasets
import whombat.api.features as features
import whombat.api.notes as notes
import whombat.api.predicted_tags as predicted_tags
import whombat.api.recordings as recordings
import whombat.api.sessions as sessions
import whombat.api.sound_event_annotations as sound_event_annotations
import whombat.api.sound_event_predictions as sound_event_predictions
import whombat.api.sound_events as sound_events
import whombat.api.spectrograms as spectrograms
import whombat.api.tags as tags
import whombat.api.users as users
from whombat.api.clip_evaluations import clip_evaluations
from whombat.api.evaluations import evaluations
from whombat.api.model_runs import model_runs
from whombat.api.sound_event_evaluations import sound_event_evaluations
from whombat.api.user_runs import user_runs
from whombat.api.evaluation_sets import evaluation_sets

__all__ = [
    "annotation_projects",
    "annotation_tasks",
    "audio",
    "clip_annotations",
    "clip_evaluations",
    "clip_predictions",
    "clips",
    "common",
    "datasets",
    "evaluation_sets",
    "evaluations",
    "features",
    "model_runs",
    "notes",
    "predicted_tags",
    "recordings",
    "sessions",
    "sound_event_annotations",
    "sound_event_evaluations",
    "sound_event_predictions",
    "sound_events",
    "spectrograms",
    "tags",
    "user_runs",
    "users",
]
