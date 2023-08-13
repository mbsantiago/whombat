"""Base class to use for all schemas in whombat."""

import datetime

from pydantic import BaseModel, ConfigDict, Field

__all__ = ["BaseSchema"]


class BaseSchema(BaseModel):
    """Base class for all schemas in whombat.

    All schemas should inherit from this class, either
    directly or indirectly.
    """

    created_at: datetime.datetime = Field(
        repr=False,
        default_factory=datetime.datetime.utcnow,
    )

    model_config = ConfigDict(from_attributes=True)
