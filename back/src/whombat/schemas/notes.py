"""Schemas for handling Notes."""

import datetime
from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.users import SimpleUser

__all__ = ["Note", "NoteUpdate", "NoteCreate"]


class NoteCreate(BaseSchema):
    """Schema for creating notes."""

    uuid: UUID = Field(default_factory=uuid4)
    """The uuid of the note."""

    message: str = Field(min_length=1, max_length=1000)
    """The message of the note."""

    created_by_id: UUID
    """The id of the user who created the note."""

    is_issue: bool = False
    """Whether the note is an issue."""


class Note(NoteCreate):
    """Schema for Note objects returned to the user."""

    id: int
    """The database id of the note."""

    created_by: SimpleUser
    """The user who created the note."""

    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.now
    )
    """The time at which the note was created."""

    def __hash__(self):
        """Hash the Note object."""
        return hash(self.uuid)


class NoteUpdate(BaseSchema):
    """Schema for updating notes."""

    message: str | None = Field(None, min_length=1, max_length=1000)
    """The message of the note."""

    is_issue: bool | None = None
    """Whether the note is an issue."""
