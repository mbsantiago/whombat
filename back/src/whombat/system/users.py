"""User Management."""

from uuid import UUID

from fastapi.security import OAuth2PasswordRequestForm
from fastapi_users import BaseUserManager, UUIDIDMixin, exceptions
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models

__all__ = [
    "UserDatabase",
    "UserManager",
]

# TODO: Manage this secret better and make it cryptographically secure
SECRET = "SECRET"


class UserDatabase(SQLAlchemyUserDatabase):
    """FastAPIUsers database class with SQLAlchemy."""

    async def has_user(self) -> bool:
        """Check if the database has a user.

        Returns
        -------
        bool
            True if the database has a user, False otherwise.
        """
        statement = select(self.user_table)
        return (await self.session.execute(statement)).first() is not None

    async def get_by_username(self, username: str) -> models.User | None:
        """Get a user by username.

        Parameters
        ----------
        username: str
            The username of the user.

        Returns
        -------
        User
            The user object.

        Raises
        ------
        UserNotExists
            If the user does not exist.
        """
        statement = select(self.user_table).where(
            self.user_table.username == username
        )
        return await self._get_user(statement)


class UserManager(
    UUIDIDMixin,
    BaseUserManager[models.User, UUID],  # type: ignore
):
    """UserManager class.

    This class is used to manage users in the database. It is a subclass of the
    BaseUserManager class from the fastapi-users package.
    """

    user_db: UserDatabase  # type: ignore

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

    async def get_by_username(self, username: str) -> models.User:
        """Get a user by username.

        Parameters
        ----------
        username: str
            The username of the user.

        Returns
        -------
        User
            The user object.

        Raises
        ------
        UserNotExists
            If the user does not exist.
        """
        user = await self.user_db.get_by_username(username)
        if not user:
            raise exceptions.UserNotExists()
        return user

    async def authenticate(
        self, credentials: OAuth2PasswordRequestForm
    ) -> models.User | None:
        """Authenticate a user.

        Parameters
        ----------
        credentials: OAuth2PasswordRequestForm
            The user credentials.

        Returns
        -------
        User
            The user object.

        Raises
        ------
        ValueError
            If the username or password is incorrect.
        """
        try:
            user = await self.get_by_username(credentials.username)
        except exceptions.UserNotExists:
            # Run the hasher to mitigate timing attack
            # Inspired from Django: https://code.djangoproject.com/ticket/20760
            self.password_helper.hash(credentials.password)
            return None

        (
            verified,
            updated_password_hash,
        ) = self.password_helper.verify_and_update(
            credentials.password, user.hashed_password
        )

        if not verified:
            return None

        # Update password hash to a more robust one if needed
        if updated_password_hash is not None:
            await self.user_db.update(
                user, {"hashed_password": updated_password_hash}
            )

        return user


async def is_first_user(session: AsyncSession) -> bool:
    """Check if this is the first user.

    Returns
    -------
    bool
        True if the database does not have a user, False otherwise.
    """
    user_db = UserDatabase(session, models.User)
    return not (await user_db.has_user())
