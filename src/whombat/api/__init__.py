"""Python API for Whombat.

This package contains the Python API for Whombat. It is used to interact with
the database and the models of Whombat.

The API is split into submodules, each containing the functions and classes
for a specific part of the database. This allows for a more structured API
and a better overview of the available functions and classes.

The Python API is used by the routers to interact between the client and the
data, and thus define the behaviour of the REST API. However, the Python API
can also be used directly to interact with the database and the models. This
can be useful if you wish to integrate your annotated data into your own
scripts or applications.
"""
from whombat.api import (
    annotation_projects,
    annotations,
    audio,
    clips,
    datasets,
    evaluation_sets,
    evaluation_tasks,
    features,
    notes,
    prediction_runs,
    recordings,
    sessions,
    sound_events,
    spectrograms,
    tags,
    tasks,
    users,
)

__all__ = [
    "annotation_projects",
    "annotations",
    "audio",
    "clips",
    "datasets",
    "evaluation_sets",
    "evaluation_tasks",
    "features",
    "prediction_runs",
    "notes",
    "recordings",
    "sessions",
    "sound_events",
    "spectrograms",
    "tags",
    "tasks",
    "users",
]
