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
import uuid
from typing import TYPE_CHECKING

import sqlalchemy.orm as orm
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users_db_sqlalchemy.generics import GUID
from sqlalchemy import Boolean, String

from whombat.database.models.base import Base

__all__ = [
    "User",
    "UserManager",
]


if TYPE_CHECKING:
    from whombat.database.models.note import Note


# TODO: Manage this secret better and make it cryptographically secure
SECRET = "SECRET"

UUID_ID = uuid.UUID


class User(Base):
    """Model for a user.

    Attributes
    ----------
        id: UUID
            The unique identifier for the user.
        username: str
            The username of the user.
        email: str
            The email address of the user.
        name: str, optional
            The full name of the user.
        hashed_password: str
            The hashed password of the user. Passwords are
            never stored in plain text.
        is_active: bool
            Whether the user is active.
        is_superuser: bool
            Whether the user is a superuser.

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

    id: orm.Mapped[UUID_ID] = orm.mapped_column(
        GUID,
        primary_key=True,
        default_factory=uuid.uuid4,
        init=False,
    )

    email: orm.Mapped[str] = orm.mapped_column(
        String(length=320),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: orm.Mapped[str] = orm.mapped_column(
        String(length=1024),
        nullable=False,
    )

    username: orm.Mapped[str] = orm.mapped_column(
        nullable=False,
        unique=True,
    )
    """The username of the user."""

    name: orm.Mapped[str | None] = orm.mapped_column(
        nullable=True, default=None
    )
    """The full name of the user."""

    is_active: orm.Mapped[bool] = orm.mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_superuser: orm.Mapped[bool] = orm.mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_verified: orm.Mapped[bool] = orm.mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    notes: orm.Mapped[list["Note"]] = orm.relationship(
        "Note",
        back_populates="created_by",
        default_factory=list,
    )


class UserManager(
    UUIDIDMixin,
    BaseUserManager[User, uuid.UUID],  # type: ignore
):
    """UserManager class.

    This class is used to manage users in the database. It is a subclass of the
    BaseUserManager class from the fastapi-users package.
    """

    def __init__(
        self,
        *args,
        reset_password_token_secret: str = SECRET,
        verification_token_secret: str = SECRET,
        **kwargs,
    ):
        """Initialize the UserManager class."""
        super().__init__(*args, **kwargs)
        self.reset_password_token_secret = reset_password_token_secret
        self.verification_token_secret = verification_token_secret
