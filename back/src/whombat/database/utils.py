"""Base module for the database."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.authentication.strategy.db import (
    AccessTokenDatabase,
    DatabaseStrategy,
)
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyAccessTokenDatabase,
)
from sqlalchemy.ext.asyncio import async_sessionmaker  # type: ignore
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)

from whombat.database import models

__all__ = [
    "models",
    "create_db_engine",
    "create_db_and_tables",
]


def create_db_engine(database_url: str) -> AsyncEngine:
    """Create the database engine.

    Parameters
    ----------
    database_url : str
        The url to the database. Defaults to `sqlite+aiosqlite://`. See
        https://docs.sqlalchemy.org/en/14/core/engines.html#database-urls for
        more information on the format.

    Notes
    -----
    If using sqlite, you need to install the `aiosqlite` package and
    include `+aiosqlite` in the url to support asynchronous operations.

    Returns
    -------
    AsyncEngine
        The database engine.

    """
    return create_async_engine(database_url)


async def create_db_and_tables(engine: AsyncEngine):
    """Create the database and tables."""
    # TODO: Use alembic to create the tables instead
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)


@asynccontextmanager
async def get_async_session(
    engine: AsyncEngine,
) -> AsyncGenerator[AsyncSession, None]:
    """Get a session to the database asynchronously."""
    async_session_maker = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    """Get the user database."""
    yield SQLAlchemyUserDatabase(session, models.User)


async def get_access_token_db(
    session: AsyncSession = Depends(get_async_session),
):
    """Get the access token database."""
    yield SQLAlchemyAccessTokenDatabase(session, models.AccessToken)


def get_database_strategy(
    access_token_db: AccessTokenDatabase[models.AccessToken] = Depends(
        get_access_token_db
    ),
) -> DatabaseStrategy:
    return DatabaseStrategy(access_token_db, lifetime_seconds=60 * 60 * 24)
