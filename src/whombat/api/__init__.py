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
import whombat.api.clips as clips
import whombat.api.datasets as datasets
import whombat.api.evaluation_sets as evaluation_sets
import whombat.api.features as features
import whombat.api.notes as notes
import whombat.api.recordings as recordings
import whombat.api.sessions as sessions
import whombat.api.sound_event_annotations as sound_event_annotations
import whombat.api.sound_events as sound_events
import whombat.api.spectrograms as spectrograms
import whombat.api.tags as tags
import whombat.api.users as users

__all__ = [
    "annotation_projects",
    "annotation_tasks",
    "audio",
    "clip_annotations",
    "clips",
    "datasets",
    "evaluation_sets",
    "features",
    "notes",
    "recordings",
    "sessions",
    "sound_event_annotations",
    "sound_events",
    "spectrograms",
    "tags",
    "users",
]
