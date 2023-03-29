"""Whombat Python API to interact with user objects in the database."""
import uuid
from contextlib import asynccontextmanager
from os import name
from typing import AsyncGenerator

from fastapi_users import BaseUserManager
from fastapi_users.exceptions import UserNotExists
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound
from sqlalchemy.future import select

from whombat import schemas
from whombat.database import models

__all__ = [
    "create",
    "get_by_id",
]


# TODO: Manage this secret better
SECRET = "SECRET"


class UserManager(BaseUserManager):
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


@asynccontextmanager
async def _get_user_db_context(
    session: AsyncSession,
) -> AsyncGenerator[SQLAlchemyUserDatabase, None]:
    """Get a SQLAlchemyUserDatabase context."""
    yield SQLAlchemyUserDatabase(session, models.User)


@asynccontextmanager
async def _get_user_manager(
    user_database: SQLAlchemyUserDatabase,
) -> AsyncGenerator[UserManager, None]:
    """Get a UserManager context."""
    yield UserManager(user_database)


@asynccontextmanager
async def _get_user_manager_from_session(
    session: AsyncSession,
) -> AsyncGenerator[UserManager, None]:
    """Get a UserManager context from a database session."""
    async with _get_user_db_context(session) as user_db:
        async with _get_user_manager(user_db) as user_manager:
            yield user_manager


async def create(
    session: AsyncSession,
    username: str,
    password: str,
    email: str,
    is_superuser: bool = False,
) -> models.User:
    """Create a user.

    This function creates a user in the database.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    username : str
        The username to use.
    password : str
        The password to use.
    email : str
        The email to use.
    is_superuser : bool, optional
        Whether the user is a superuser, by default False.

    Returns
    -------
    user : models.User

    Notes
    -----
    This function is asynchronous.

    Raises
    ------
    UserAlreadyExists
        If a user with the same username or email already exists.

    Examples
    --------
    To create a user:

    .. code-block:: python

        async with create_session() as session:
            user = await create_user(
                session,
                username="username",
                password="password",
                email="email",
            )

    """
    async with _get_user_manager_from_session(session) as user_manager:
        return await user_manager.create(
            schemas.users.UserCreate(
                username=username,
                password=password,
                email=email,  # type: ignore
                is_superuser=is_superuser,
                name=name,
            )
        )


async def get_by_id(session: AsyncSession, user_id: uuid.UUID) -> models.User:
    """Get a user by id.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    user_id : uuid.UUID
        The id to use.

    Returns
    -------
    user : models.User

    Raises
    ------
    sqlalchemy.exc.NoResultFound
        If no user with the given id exists.
    """
    try:
        async with _get_user_manager_from_session(session) as user_manager:
            return await user_manager.get(user_id)
    except UserNotExists as error:
        raise NoResultFound from error


async def get_by_username(session: AsyncSession, username: str) -> models.User:
    """Get a user by username.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    username : str
        The username to use.

    Returns
    -------
    user : models.User

    Raises
    ------
    sqlalchemy.exc.NoResultFound
        If no user with the given username exists.

    """
    q = select(models.User).where(models.User.username == username)
    result = await session.execute(q)
    return result.scalars().one()


async def get_by_email(session: AsyncSession, email: str) -> models.User:
    """Get a user by email.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    email : str
        The email to use.

    Returns
    -------
    user : models.User

    Raises
    ------
    sqlalchemy.exc.NoResultFound
        If no user with the given email exists.

    """
    try:
        async with _get_user_manager_from_session(session) as user_manager:
            return await user_manager.get_by_email(email)
    except UserNotExists as error:
        raise NoResultFound from error
