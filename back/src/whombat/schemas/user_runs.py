"""Schemas for handling User Runs."""

from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.users import SimpleUser

__all__ = [
    "UserRunCreate",
    "UserRunUpdate",
    "UserRun",
]


class UserRunCreate(BaseModel):
    """Model Run creation schema."""


class UserRun(BaseSchema):
    """Schema of a user run as returned to the user."""

    uuid: UUID
    """Unique identifier of the user run."""

    id: int = Field(..., exclude=True)
    """The databset identifier of the model run."""

    user: SimpleUser
    """The user who created the user run."""


class UserRunUpdate(BaseModel):
    """Schema for updating a user run."""

    uuid: UUID = Field(default_factory=uuid4)
    """Unique identifier of the user run."""
