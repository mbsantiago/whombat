"""Settings for whombat.

We are using pydantic to define our settings.
"""
from pathlib import Path

from pydantic_settings import BaseSettings

__all__ = ["Settings"]


class Settings(BaseSettings):
    """Settings for whombat."""

    db_dialect: str = "sqlite"
    """Database dialect."""

    db_username: str | None = None

    db_password: str | None = None

    db_host: str | None = None

    db_port: int | None = None

    db_name: str = "whombat.db"
    """Name of the database where all data is stored.

    In case of SQLite, this is the path to the database file relative
    to the project root.
    """

    db_url: str | None = None
    """Database URL.

    If this is set, it will override all other database settings.
    Only use this if you know what you are doing.
    """

    audio_dir: Path = Path.home()
    """Directory where the all audio files are stored.

    It is assumed that all audio files are stored within this directory.
    They can be stored in subdirectories in any structure, however any
    files outside of this directory will not be accessible.

    This is a security measure to prevent users from accessing files
    outside of the audio directory.
    """

    app_name: str = "Whombat"

    admin_username: str = "admin"
    """Username of the admin user."""

    admin_password: str = "admin"
    """Password of the admin user."""

    admin_email: str = "admin@whombat.com"
    """Email of the admin user."""

    backend_host: str = "localhost"
    """Host on which the backend is running."""

    backend_port: int = 5000
    """Port on which the backend is running."""

    debug: bool = True
    """Enable debug mode.

    Should be disabled in production.
    """

    log_level: str = "debug"
    """Log level for the application.

    Should be set to INFO in production.
    """

    cors_origins: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5000",
        "https://localhost",
        "https://localhost:3000",
        "https://localhost:5000",
    ]
    """Allowed origins for CORS."""
