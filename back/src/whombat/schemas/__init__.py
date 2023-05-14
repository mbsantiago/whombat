"""Schemas for Whombat data models.

The Whombat Python API returns these schemas to the user, and 
they are the main way that the user interacts with the data.

Schemas are defined using Pydantic, and are used to
validate data before it is inserted into the database, and also to
validate data before it is returned to the user.

Most database models have multiple schemas, a main schema that
is used to return data to the user, and a create and update
schema that is used to validate data before it is inserted into
the database.

"""

from whombat.schemas.datasets import (
    Dataset,
    DatasetFile,
    DatasetRecording,
    FileState,
)
from whombat.schemas.features import Feature
from whombat.schemas.recordings import Recording
from whombat.schemas.tags import Tag
from whombat.schemas.users import User
from whombat.schemas.notes import Note
from whombat.schemas.clips import Clip

__all__ = [
    "Clip",
    "Dataset",
    "DatasetFile",
    "DatasetRecording",
    "Feature",
    "FileState",
    "Note",
    "Recording",
    "Tag",
    "User",
]
