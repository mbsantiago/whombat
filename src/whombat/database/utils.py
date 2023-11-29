"""Base module for the database."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import async_sessionmaker  # type: ignore
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine

from whombat import models

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


def supports_returning(session: AsyncSession) -> bool:
    """Check if the current database session suports insert with RETURNING."""
    engine = session.get_bind()
    dialect = engine.dialect
    return dialect.insert_executemany_returning
