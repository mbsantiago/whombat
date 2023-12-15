"""Base class to use for all schemas in whombat."""

import datetime
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict, Field

__all__ = ["BaseSchema", "Page"]


class BaseSchema(BaseModel):
    """Base class for all schemas in whombat.

    All schemas should inherit from this class, either directly or
    indirectly.
    """

    created_on: datetime.datetime = Field(
        repr=False,
        default_factory=datetime.datetime.utcnow,
    )

    model_config = ConfigDict(from_attributes=True)


M = TypeVar("M")


class Page(BaseModel, Generic[M]):
    """A page of results."""

    items: Sequence[M]
    total: int
    offset: int
    limit: int
