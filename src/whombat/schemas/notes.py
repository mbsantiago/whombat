"""Schemas for handling Notes."""

import datetime
from uuid import UUID, uuid4

from pydantic import Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.users import SimpleUser

__all__ = ["Note", "NoteUpdate", "NoteCreate"]


class NoteCreate(BaseSchema):
    """Schema for creating notes.

    This schema is used when creating notes from the API as the user
    does not need to provide the id of the user who created the note.
    """

    uuid: UUID = Field(default_factory=uuid4)

    message: str = Field(min_length=1, max_length=1000)

    is_issue: bool = False

    created_by_id: UUID | None = None


class Note(NoteCreate):
    """Schema for Note objects returned to the user."""

    id: int
    """The database id of the note."""

    created_by: SimpleUser
    """The user who created the note."""

    created_on: datetime.datetime = Field(
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
