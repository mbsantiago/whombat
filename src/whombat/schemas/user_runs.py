"""Schemas for handling User Runs."""
from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema

__all__ = [
    "UserRunCreate",
    "UserRunUpdate",
    "UserRun",
]


class UserRunCreate(BaseSchema):
    """Model Run creation schema."""

    uuid: UUID = Field(default_factory=uuid4)
    """Unique identifier of the user run."""

    user_id: UUID
    """ID of the user who created the user run."""


class UserRun(UserRunCreate):
    """Schema of a user run as returned to the user."""

    id: int
    """The databset identifier of the model run."""


class UserRunUpdate(BaseSchema):
    """Schema for updating a user run."""

    uuid: UUID = Field(default_factory=uuid4)
    """Unique identifier of the user run."""

    user_id: UUID
    """ID of the user who created the user run."""


class UserRunPredictionCreate(BaseSchema):
    """Schema for creating a user run prediction."""

    user_run_id: int
    """ID of the user run."""

    clip_prediction_id: int
    """ID of the clip prediction."""
