"""Base class to use for all schemas in whombat."""

import datetime
from pathlib import Path
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field
from pydantic_core import core_schema

from whombat.dependencies import get_settings

__all__ = ["BaseSchema", "Page"]


def get_default_context() -> dict[str, Any]:
    """Get the default context for validation."""
    return {"audio_dir": get_settings().audio_dir}


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


def relative_to_audio_dir(v: Path, info: core_schema.ValidationInfo) -> Path:
    """Check that the audio directory is in the root audio directory.

    Returns the relative path to the audio directory.
    """
    context = info.context
    if context is None:
        return v

    audio_dir = context.get("audio_dir")
    if audio_dir is None:
        return v

    path = v.absolute()
    if not path.is_relative_to(audio_dir):
        raise ValueError(
            f"Path ({v}) must be in the root " f"audio directory: {audio_dir}"
        )

    return path.relative_to(audio_dir)


M = TypeVar("M", bound=BaseSchema)


class Page(BaseModel, Generic[M]):
    """A page of results."""

    items: list[M]
    total: int
    offset: int
    limit: int
