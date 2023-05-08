"""Note model.

Notes are user messages that can be attached to recordings, clips, or sound
events. They serve as a way to provide additional textual context or discuss
specific aspects of the annotation with other users. Notes can be added to any
item within the annotation project, including completed tasks or individual
sound events.

Users can mark notes as an issue to flag incomplete or incorrect annotations or
to indicate that a specific item needs attention from other users. When a note
is marked as an issue, it becomes more visible to other annotators and can be
easily accessed through the project interface.

Notes can be particularly useful for providing context or explanations about
specific annotations, or for discussing alternative interpretations of the same
sound event. Additionally, they can be used to provide feedback to other users
or to ask for clarification about specific annotations.

"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey

from whombat.database.models.base import Base
from whombat.database.models.user import User

__all__ = [
    "Note",
]


class Note(Base):
    """Note model."""

    __tablename__ = "note"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The id of the note."""

    message: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The message of the note."""

    is_issue: orm.Mapped[bool] = orm.mapped_column(
        nullable=False,
        default=False,
    )
    """Whether the note is an issue."""

    created_by_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=False,
    )
    """The id of the user who created the note."""

    created_by: orm.Mapped[User] = orm.relationship()
    """The user who created the note."""
