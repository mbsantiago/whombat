"""Schemas for Annotation Projects."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.tags import Tag

__all__ = [
    "AnnotationProjectCreate",
    "AnnotationProject",
    "AnnotationProjectUpdate",
]


class AnnotationProjectCreate(BaseModel):
    """Schema for creating an annotation project."""

    name: str
    """Name of the annotation project."""

    description: str
    """A description of the annotation project."""

    annotation_instructions: str | None = None
    """Project instructions for annotating."""


class AnnotationProject(BaseSchema):
    """Schema for an annotation project."""

    uuid: UUID
    """UUID of the annotation project."""

    id: int = Field(..., exclude=True)
    """Database ID of the annotation project."""

    name: str
    """Name of the annotation project."""

    description: str
    """A description of the annotation project."""

    annotation_instructions: str | None = None
    """Project instructions for annotating."""

    tags: list[Tag] = Field(default_factory=list)
    """Tags to be used throughout the annotation project."""


class AnnotationProjectUpdate(BaseModel):
    """Schema for updating an annotation project."""

    name: str | None = None
    """Name of the annotation project."""

    description: str | None = None
    """A description of the annotation project."""

    annotation_instructions: str | None = None
    """Project instructions for annotating."""
