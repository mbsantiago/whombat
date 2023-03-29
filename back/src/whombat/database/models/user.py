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
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Column, String

from whombat.database.models.base import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
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

    username = Column(String, unique=True, nullable=False)
    """The username of the user."""

    name = Column(String, nullable=True)
    """The full name of the user."""
