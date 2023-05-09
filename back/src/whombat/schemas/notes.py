"""Schemas for handling Notes."""

import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

__all__ = ["Note", "NoteUpdate", "NoteCreate"]


class Note(BaseModel):
    """Schema for Note objects returned to the user."""

    uuid: UUID = Field(default_factory=uuid4)
    """The id of the note."""

    message: str
    """The message of the note."""

    created_by: str
    """The username of the user who created the note."""

    is_issue: bool = False
    """Whether the note is an issue."""

    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.now
    )
    """The time at which the note was created."""

    class Config:
        """Pydantic configuration."""

        orm_mode = True

    def __hash__(self):
        """Hash the Note object."""
        return hash(self.uuid)


class NoteCreate(BaseModel):
    """Schema for creating notes."""

    message: str = Field(..., min_length=1, max_length=1000)
    """The message of the note."""

    created_by: str = Field(..., min_length=1, max_length=100)
    """The username of the user who created the note."""

    is_issue: bool = False
    """Whether the note is an issue."""


class NoteUpdate(BaseModel):
    """Schema for updating notes."""

    message: str | None = Field(None, min_length=1, max_length=1000)
    """The message of the note."""

    is_issue: bool | None
    """Whether the note is an issue."""
