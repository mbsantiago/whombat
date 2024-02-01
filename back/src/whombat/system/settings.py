"""Settings for whombat.

We are using pydantic to define our settings.
"""

import warnings
from functools import lru_cache
from pathlib import Path
from typing import Tuple, Type

from pydantic import ValidationError
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)

from whombat.system.data import get_whombat_db_file, get_whombat_settings_file

__all__ = [
    "get_settings",
    "Settings",
]


class Settings(BaseSettings):
    """Settings for whombat."""

    model_config = SettingsConfigDict(
        env_prefix="WHOMBAT_",
    )

    dev: bool = False
    """True if the application is running in development mode.

    When running in development mode, the application will log to stdout
    use a SQLite database in the project root and reload the application
    when changes are made to the source code.
    """

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

    host: str = "localhost"
    """Host on which the backend is running."""

    port: int = 5000
    """Port on which the backend is running."""

    domain: str = "localhost"
    """Domain on which the backend is running."""

    log_config: Path = Path("logging.conf")
    """Path to the logging configuration file relative to the project root."""

    log_to_file: bool = True
    """Log to a file."""

    log_to_stdout: bool = False
    """Log to stdout."""

    log_dir: Path = Path("logs")
    """Path to the directory where log files are stored relative to the project root."""

    log_level: str = "info"
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

    open_on_startup: bool = True
    """Open the application in the browser on startup."""

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: Type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> Tuple[PydanticBaseSettingsSource, ...]:
        return (
            env_settings,
            dotenv_settings,
            file_secret_settings,
            init_settings,
        )


@lru_cache()
def get_settings() -> Settings:
    """Get the application settings."""
    return load_settings_from_file()


def load_settings_from_file() -> Settings:
    """Load the application settings from a file."""
    settings_file = get_whombat_settings_file()

    if not settings_file.exists():
        store_default_settings()

    try:
        return Settings.model_validate_json(settings_file.read_text())
    except ValidationError:
        # NOTE: This should only happen if the user has manually edited
        # the settings file and made a mistake, or if the settings schema
        # has changed. In both cases, we want to store the default settings
        # to the file.
        warnings.warn(
            f"Settings file {settings_file} is invalid. "
            "Storing default settings to file."
        )
        store_default_settings()

    return Settings.model_validate_json(settings_file.read_text())


def store_default_settings() -> None:
    """Store the default settings to a file."""
    default_settings = Settings(
        db_name=str(get_whombat_db_file()),
    )
    write_settings_to_file(default_settings)


def write_settings_to_file(settings: Settings) -> None:
    """Write the application settings to a file."""
    settings_file = get_whombat_settings_file()

    if not settings_file.parent.exists():
        settings_file.parent.mkdir(parents=True)

    settings_file.write_text(settings.model_dump_json())
    get_settings.cache_clear()
