"""Schemas for Annotation Projects."""

from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.tags import Tag

__all__ = [
    "AnnotationProjectCreate",
    "AnnotationProject",
    "AnnotationProjectUpdate",
]


class AnnotationProjectCreate(BaseSchema):
    """Schema for creating an annotation project."""

    uuid: UUID = Field(default_factory=uuid4)
    """UUID of the annotation project."""

    name: str
    """Name of the annotation project."""

    description: str
    """A description of the annotation project."""

    annotation_instructions: str | None = None
    """Project instructions for annotating."""


class AnnotationProject(AnnotationProjectCreate):
    """Schema for an annotation project."""

    id: int
    """Database ID of the annotation project."""

    tags: list[Tag] = Field(default_factory=list)
    """Tags to be used throughout the annotation project."""


class AnnotationProjectUpdate(BaseSchema):
    """Schema for updating an annotation project."""

    name: str | None = None
    """Name of the annotation project."""

    description: str | None = None
    """A description of the annotation project."""

    annotation_instructions: str | None = None
    """Project instructions for annotating."""
