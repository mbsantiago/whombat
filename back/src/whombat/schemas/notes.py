"""Schemas for handling Notes."""

from uuid import UUID

from pydantic import BaseModel, Field

from whombat.schemas.base import BaseSchema
from whombat.schemas.users import SimpleUser

__all__ = ["Note", "NoteUpdate", "NoteCreate"]


class NoteCreate(BaseModel):
    """Schema for creating notes.

    This schema is used when creating notes from the API as the user
    does not need to provide the id of the user who created the note.
    """

    message: str = Field(min_length=1, max_length=1000)

    is_issue: bool = False


class Note(BaseSchema):
    """Schema for Note objects returned to the user."""

    uuid: UUID
    """The uuid of the note."""

    id: int = Field(..., exclude=True)
    """The database id of the note."""

    message: str
    """The message of the note."""

    is_issue: bool
    """Whether the note is an issue."""

    created_by: SimpleUser | None
    """The user who created the note."""

    def __hash__(self):
        """Hash the Note object."""
        return hash(self.uuid)


class NoteUpdate(BaseModel):
    """Schema for updating notes."""

    message: str | None = Field(None, min_length=1, max_length=1000)
    """The message of the note."""

    is_issue: bool | None = None
    """Whether the note is an issue."""
