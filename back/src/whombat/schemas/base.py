"""Base class to use for all schemas in whombat."""

from pydantic import BaseModel, ConfigDict

__all__ = ["BaseSchema"]


class BaseSchema(BaseModel):
    """Base class for all schemas in whombat.

    All schemas should inherit from this class, either
    directly or indirectly.
    """

    model_config = ConfigDict(from_attributes=True)
