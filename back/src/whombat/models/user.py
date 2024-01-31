"""Model for whombat user.

Most interactions with the database are done through the User class.
When creating annotations, notes, etc. the user is automatically
associated with the object, to help track who did what. This allows for
a more collaborative environment, where users can see others
contributions and comment on them, and understand any potential
conflicts or biases in the annotations.

Whombat stores minimal information about users. The only required
information is a username, which is used to identify the user.
Additional information can be added, such as a full name, email, and
affiliation. This information is not required.
"""

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import String

from whombat.models.base import Base

__all__ = [
    "User",
]


class User(Base):
    """Model for a user.

    Attributes
    ----------
    id
        The unique identifier for the user.
    email
        The email address of the user.
    hashed_password
        The hashed password of the user.
    username
        The username of the user.
    name
        The full name of the user.
    is_active
        Whether the user is active. Inactive users cannot log in.
    is_superuser
        Whether the user is a superuser. Superusers have all permissions.
    is_verified
        Whether the user is verified.

    Notes
    -----
    We are using the fastapi-users package to handle user authentication. This
    package is built on top of SQLAlchemy. The User class inherits from the
    SQLAlchemyBaseUserTableUUID class, which provides the id, email,
    hashed_password, is_active, and is_superuser attributes. The username and
    name attribute is added to the User class.

    Do not instantiate this class directly. Instead, use the create_user
    function of the `whombat.api.users` module.
    """

    __tablename__ = "user"

    email: orm.Mapped[str] = orm.mapped_column(
        String(length=320),
        unique=True,
        index=True,
    )
    hashed_password: orm.Mapped[str] = orm.mapped_column(String(length=1024))
    username: orm.Mapped[str] = orm.mapped_column(unique=True)
    id: orm.Mapped[UUID] = orm.mapped_column(
        primary_key=True, default_factory=uuid4, kw_only=False
    )
    name: orm.Mapped[Optional[str]] = orm.mapped_column(default=None)
    is_active: orm.Mapped[bool] = orm.mapped_column(default=True)
    is_superuser: orm.Mapped[bool] = orm.mapped_column(default=False)
    is_verified: orm.Mapped[bool] = orm.mapped_column(default=False)

    # Back references

    if TYPE_CHECKING:
        from whombat.models.note import Note
        from whombat.models.recording import Recording, RecordingOwner
        from whombat.models.sound_event_annotation import (
            SoundEventAnnotationTag,
        )
        from whombat.models.user_run import UserRun

    notes: orm.Mapped[list["Note"]] = orm.relationship(
        back_populates="created_by",
        default_factory=list,
        repr=False,
        init=False,
    )
    sound_event_annotation_tags: orm.Mapped[
        list["SoundEventAnnotationTag"]
    ] = orm.relationship(
        back_populates="created_by",
        default_factory=list,
        repr=False,
        init=False,
    )
    recordings: orm.Mapped[list["Recording"]] = orm.relationship(
        back_populates="owners",
        secondary="recording_owner",
        viewonly=True,
        default_factory=list,
        repr=False,
        init=False,
    )
    recording_owner: orm.Mapped[list["RecordingOwner"]] = orm.relationship(
        back_populates="user",
        default_factory=list,
        repr=False,
        init=False,
    )
    user_runs: orm.Mapped[list["UserRun"]] = orm.relationship(
        back_populates="user",
        default_factory=list,
        repr=False,
        init=False,
    )
