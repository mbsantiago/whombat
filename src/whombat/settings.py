"""Settings for whombat.

We are using pydantic to define our settings.
"""
from pathlib import Path

from pydantic_settings import BaseSettings

__all__ = ["Settings"]


class Settings(BaseSettings):
    """Settings for whombat."""

    db_url: str = "sqlite+aiosqlite:///whombat.db"

    audio_dir: Path = Path.home()

    app_name: str = "Whombat"

    admin_username: str = "admin"

    admin_password: str = "admin"

    admin_email: str = "admin@whombat.com"
