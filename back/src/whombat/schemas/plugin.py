"""Schemas for handling Plugin information."""

from pydantic import BaseModel, Field

__all__ = [
    "PluginInfo",
]


class PluginInfo(BaseModel):
    """Plugin information."""

    name: str = Field(..., description="Plugin name.")
    url: str = Field(..., description="Route to the plugin pages.")
    description: str | None = Field(
        default=None,
        description="Plugin description.",
    )
    version: str | None = Field(
        default=None,
        description="Plugin version.",
    )
    thumbnail: str | None = Field(
        default=None,
        description="Plugin thumbnail.",
    )
    attribution: str | None = Field(
        default=None,
        description="Plugin attribution.",
    )
