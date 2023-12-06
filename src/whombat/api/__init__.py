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
import whombat.api.audio as audio
import whombat.api.common as common
import whombat.api.datasets as datasets
import whombat.api.features as features
import whombat.api.notes as notes
import whombat.api.recordings as recordings
import whombat.api.sessions as sessions
import whombat.api.spectrograms as spectrograms
import whombat.api.tags as tags
import whombat.api.users as users
from whombat.api.annotation_projects import annotation_projects
from whombat.api.annotation_tasks import annotation_tasks
from whombat.api.clip_annotations import clip_annotations
from whombat.api.clip_evaluations import clip_evaluations
from whombat.api.clip_predictions import clip_predictions
from whombat.api.clips import clips
from whombat.api.evaluation_sets import evaluation_sets
from whombat.api.evaluations import evaluations
from whombat.api.model_runs import model_runs
from whombat.api.sound_event_annotations import sound_event_annotations
from whombat.api.sound_event_evaluations import sound_event_evaluations
from whombat.api.sound_event_predictions import sound_event_predictions
from whombat.api.sound_events import sound_events
from whombat.api.status_badges import status_badges
from whombat.api.user_runs import user_runs

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
    "status_badges",
]
