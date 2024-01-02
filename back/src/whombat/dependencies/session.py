"""Common database session dependencies."""
from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import async_sessionmaker  # type: ignore
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)

from whombat.database.utils import get_database_url
from whombat.dependencies.settings import WhombatSettings

__all__ = [
    "Session",
    "get_async_session",
]


def create_engine(settings: WhombatSettings):
    """Create an async engine for the database."""
    db_url = get_database_url(settings)
    return create_async_engine(db_url, insertmanyvalues_page_size=500)


def create_session_maker(engine: AsyncEngine):
    """Create a session maker for the database."""
    return async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session(
    settings: WhombatSettings,
) -> AsyncGenerator[AsyncSession, None]:
    """Get an async session for the database."""
    session_maker = create_session_maker(create_engine(settings))
    async with session_maker() as session:
        yield session


Session = Annotated[AsyncSession, Depends(get_async_session)]
