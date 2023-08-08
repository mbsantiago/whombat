"""Common FastAPI dependencies for the application."""
from typing import AsyncGenerator

from fastapi import Depends
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
from whombat.settings import Settings, get_settings


def create_engine(settings: Settings):
    """Create an async engine for the database."""
    return create_async_engine(settings.db_url)


def create_session_maker(engine: AsyncEngine):
    """Create a session maker for the database."""
    return async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables(engine: AsyncEngine):
    """Create the database and tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)


async def get_async_session(
    settings: Settings = Depends(get_settings),
) -> AsyncGenerator[AsyncSession, None]:
    """Get an async session for the database."""
    session_maker = create_session_maker(create_engine(settings))
    async with session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    """Get the user database.""" ""
    yield SQLAlchemyUserDatabase(session, models.User)  # type: ignore


async def get_access_token_db(
    session: AsyncSession = Depends(get_async_session),
):
    """Get the access token database."""
    yield SQLAlchemyAccessTokenDatabase(
        session,
        models.AccessToken,  # type: ignore
    )


async def get_user_manager(user_db=Depends(get_user_db)):
    """Get the user manager."""
    yield models.UserManager(user_db)
