"""Python API to manage database sessions."""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession

from whombat.system import database, get_settings
from whombat.system.settings import Settings, load_settings_from_path

__all__ = [
    "create_session",
]


@asynccontextmanager
async def create_session(
    db_url: str | URL | None = None,
    settings: Settings | None = None,
    config_path: str | Path | None = None,
) -> AsyncGenerator[AsyncSession, None]:
    """Create a database session.

    This function creates a database session that can be used to interact with
    the database.

    It is a context manager, so it can be used with the ``async with`` syntax.

    Parameters
    ----------
    db_url : str or URL, optional
        Explicit database URL. Takes precedence over settings and config_path.
    settings : Settings, optional
        Application settings used when db_url is omitted. Takes precedence
        over config_path.
    config_path : str or Path, optional
        Path to a Whombat JSON settings file used to derive the database URL.
        By default, Whombat loads its settings from the application settings
        directory (see get_whombat_settings_file).

    Yields
    ------
    session: AsyncSession
        The database session.

    Raises
    ------
    SettingsError
        If the settings file cannot be loaded or validated.

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

    You can specify a settings object to use.

    ```python
    from whombat.system.settings import Settings

    settings = Settings(db_url="sqlite+aiosqlite:///my_db.db")

    async with create_session(settings=settings) as session:
        # Do stuff with the session
        # ...
    ```

    You can specify a path to a Whombat JSON settings file to use.

    ```python
    async with create_session(config_path="path/to/settings.json") as session:
        # Do stuff with the session
        # ...
    ```

    """
    if db_url is None:
        if settings is None:
            if config_path is not None:
                settings = load_settings_from_path(config_path)
            else:
                settings = get_settings()
        db_url = database.get_database_url(settings)

    engine = database.create_async_db_engine(db_url)
    try:
        async with database.get_async_session(engine) as session:
            yield session
    finally:
        await engine.dispose()
