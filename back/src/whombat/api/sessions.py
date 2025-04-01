"""Python API to manage database sessions."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession

from whombat.system import database

__all__ = [
    "create_session",
]


DEFAULT_DB_URL = "sqlite+aiosqlite://"
"""Default database URL to use if none is provided."""


@asynccontextmanager
async def create_session(
    db_url: str | URL = DEFAULT_DB_URL,
) -> AsyncGenerator[AsyncSession, None]:
    """Create a database session.

    This function creates a database session that can be used to interact with
    the database.

    It is a context manager, so it can be used with the ``async with`` syntax.

    Parameters
    ----------
    db_url : str, optional
        The database URL to use, by default it is set to
        ``sqlite+aiosqlite://``, which is an in-memory database.

    Yields
    ------
    session: AsyncSession
        The database session.

    Examples
    --------
    To create a database session, use the ``async with`` syntax.

    ```python
    async with create_session() as session:
        # Do stuff with the session
        # ...
    ```

    You can specify a database URL to use.

    ```python
    async with create_session("sqlite+aiosqlite:///my_db.db") as session:
        # Do stuff with the session
        # ...
    ```

    Note
    ----
    This function is asynchronous, so it must be called with the ``await``
    keyword.
    """
    engine = database.create_async_db_engine(db_url)
    async with database.get_async_session(engine) as session:
        yield session
