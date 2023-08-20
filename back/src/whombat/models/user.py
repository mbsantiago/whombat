"""Model for whombat user.

Most interactions with the database are done through the User class.
When creating annotations, notes, etc. the user is automatically
associated with the object, to help track who did what. This allows
for a more collaborative environment, where users can see others
contributions and comment on them, and understand any potential
conflicts or biases in the annotations.

Whombat stores minimal information about users. The only required
information is a username, which is used to identify the user.
Additional information can be added, such as a full name, email,
and affiliation. This information is not required.
"""
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import String

from whombat.models.base import Base

__all__ = [
    "User",
]


if TYPE_CHECKING:
    from whombat.models.note import Note


class User(Base):
    """Model for a user.

    Notes
    -----
    We are using the fastapi-users package to handle user
    authentication. This package is built on top of
    SQLAlchemy. The User class inherits from the
    SQLAlchemyBaseUserTableUUID class, which provides
    the id, email, hashed_password, is_active, and
    is_superuser attributes. The username and name
    attribute is added to the User class.

    """

    __tablename__ = "user"

    id: orm.Mapped[UUID] = orm.mapped_column(
        primary_key=True,
        default_factory=uuid4,
        init=False,
    )
    """The unique identifier for the user."""

    email: orm.Mapped[str] = orm.mapped_column(
        String(length=320),
        unique=True,
        index=True,
    )
    """The email address of the user."""

    hashed_password: orm.Mapped[str] = orm.mapped_column(
        String(length=1024),
    )
    """The hashed password of the user."""

    username: orm.Mapped[str] = orm.mapped_column(
        unique=True,
    )
    """The username of the user."""

    name: orm.Mapped[str | None] = orm.mapped_column(default=None)
    """The full name of the user."""

    is_active: orm.Mapped[bool] = orm.mapped_column(default=True)
    """Whether the user is active."""

    is_superuser: orm.Mapped[bool] = orm.mapped_column(default=False)
    """Whether the user is a superuser."""

    is_verified: orm.Mapped[bool] = orm.mapped_column(default=False)
    """Whether the user is verified."""

    notes: orm.Mapped[list["Note"]] = orm.relationship(
        back_populates="created_by",
        default_factory=list,
        repr=False,
        init=False,
    )
