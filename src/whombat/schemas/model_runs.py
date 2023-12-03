"""Schemas for handling Prediction Runs."""
from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema

__all__ = [
    "ModelRunUpdate",
    "ModelRunCreate",
    "ModelRun",
]


class ModelRunCreate(BaseSchema):
    """Model Run creation schema."""

    uuid: UUID = Field(default_factory=uuid4)
    """Unique identifier of the model run."""

    name: str
    """Name of the model used to generate the model run."""

    version: str
    """Version of the model used to generate the model run."""

    description: str | None = None
    """A description of the model used to generate the model run."""


class ModelRun(ModelRunCreate):
    """Schema of a model run as returned to the user."""

    id: int
    """The databset identifier of the model run."""


class ModelRunUpdate(BaseSchema):
    """Model Run update schema."""

    name: str | None = None
    """The name of the model used to generate the model run."""

    version: str | None = None
    """The version of the model used to generate the model run."""

    description: str | None = None
    """The description of the model used to generate the model run."""
