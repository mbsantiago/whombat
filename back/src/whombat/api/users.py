"""Whombat Python API to interact with user objects in the database."""
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi_users.exceptions import UserNotExists
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from whombat import exceptions, schemas
from whombat.database import models

__all__ = [
    "create_user",
    "get_user_by_id",
    "get_user_by_email",
    "get_user_by_username",
    "get_users",
    "update_user",
    "delete_user",
]


@asynccontextmanager
async def _get_user_db_context(
    session: AsyncSession,
) -> AsyncGenerator[SQLAlchemyUserDatabase, None]:
    """Get a SQLAlchemyUserDatabase context."""
    yield SQLAlchemyUserDatabase(session, models.User)  # type: ignore


@asynccontextmanager
async def _get_user_manager(
    user_database: SQLAlchemyUserDatabase,
) -> AsyncGenerator[models.UserManager, None]:
    """Get a UserManager context."""
    yield models.UserManager(user_database)


@asynccontextmanager
async def _get_user_manager_from_session(
    session: AsyncSession,
) -> AsyncGenerator[models.UserManager, None]:
    """Get a UserManager context from a database session."""
    async with _get_user_db_context(session) as user_db:
        async with _get_user_manager(user_db) as user_manager:
            yield user_manager


async def create_user(
    session: AsyncSession,
    data: schemas.UserCreate,
) -> schemas.User:
    """Create a user.

    This function creates a user in the database.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data : schemas.UserCreate
        The data to use for the user creation.

    Returns
    -------
    user : schemas.User

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
        db_user = await user_manager.create(data)
        session.add(db_user)
        await session.commit()
        return schemas.User.model_validate(db_user)


async def get_user_by_id(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> schemas.User:
    """Get a user by id.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    user_id : uuid.UUID
        The id to use.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    whombat.exceptions.NotFoundError
    """
    try:
        async with _get_user_manager_from_session(session) as user_manager:
            db_user = await user_manager.get(user_id)
            return schemas.User.model_validate(db_user)
    except UserNotExists as error:
        raise exceptions.NotFoundError from error


async def get_user_by_username(
    session: AsyncSession,
    username: str,
) -> schemas.User:
    """Get a user by username.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    username : str
        The username to use.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    whombat.exceptions.NotFoundError

    """
    q = select(models.User).where(models.User.username == username)
    result = await session.execute(q)
    try:
        db_user = result.scalars().one()
    except NoResultFound as error:
        raise exceptions.NotFoundError("User not found") from error
    return schemas.User.model_validate(db_user)


async def get_user_by_email(
    session: AsyncSession,
    email: str,
) -> schemas.User:
    """Get a user by email.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    email : str
        The email to use.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    whombat.exceptions.NotFoundError

    """
    try:
        async with _get_user_manager_from_session(session) as user_manager:
            db_user = await user_manager.get_by_email(email)
            return schemas.User.model_validate(db_user)
    except UserNotExists as error:
        raise exceptions.NotFoundError("No user with that email") from error


async def update_user(
    session: AsyncSession,
    user_id: uuid.UUID,
    data: schemas.UserUpdate,
) -> schemas.User:
    """Update a user.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    user_id : uuid.UUID
        The id of the user to update.

    data : schemas.UserUpdate
        The data to update the user with.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    sqlalchemy.exc.NoResultFound
        If no user with the given id exists.

    """
    async with _get_user_manager_from_session(session) as user_manager:
        db_user = await user_manager.get(user_id)
        db_user = await user_manager.update(data, db_user)
        return schemas.User.model_validate(db_user)


async def get_users(
    session: AsyncSession,
    offset: int = 0,
    limit: int = 100,
) -> list[schemas.User]:
    """Get all users.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    offset : int, optional
        The number of users to skip, by default 0.

    limit : int, optional
        The number of users to get, by default 100.

    Returns
    -------
    users : List[schemas.User]

    """
    select_query = select(models.User).offset(offset).limit(limit)
    result = await session.execute(select_query)
    db_users = result.scalars().all()
    return [schemas.User.model_validate(db_user) for db_user in db_users]


async def delete_user(session: AsyncSession, user: schemas.User) -> None:
    """Delete a user.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    user : schemas.User
        The user to delete.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no user with the given id exists.

    """
    async with _get_user_manager_from_session(session) as user_manager:
        try:
            db_user = await user_manager.get(user.id)
        except UserNotExists as error:
            raise exceptions.NotFoundError("No user with that id") from error
        await user_manager.delete(db_user)
