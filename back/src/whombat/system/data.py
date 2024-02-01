"""Whombat Data management."""

import os
import sys
from pathlib import Path

__all__ = [
    "get_app_data_dir",
    "get_whombat_settings_file",
    "get_whombat_db_file",
]


def _get_windows_app_data_dir() -> Path:
    """Get the application data directory on Windows."""
    return Path.home() / "AppData" / "Local" / "whombat"


def _get_linux_app_data_dir() -> Path:
    """Get the application data directory on Linux."""
    return Path.home() / ".local" / "share" / "whombat"


def _get_macos_app_data_dir() -> Path:
    """Get the application data directory on MacOS."""
    return Path.home() / "Library" / "Application Support" / "whombat"


def get_app_data_dir() -> Path:
    """Get the application data directory.

    This is platform dependent. Can be set with the `WHOMBAT_DATA_DIR`
    environment variable.
    """

    if "WHOMBAT_DATA_DIR" in os.environ:
        data_dir = Path(os.environ["WHOMBAT_DATA_DIR"])
        data_dir.mkdir(parents=True, exist_ok=True)
        return data_dir

    platform = sys.platform

    if platform == "win32":
        data_dir = _get_windows_app_data_dir()
    elif platform.startswith("linux"):
        data_dir = _get_linux_app_data_dir()
    elif platform == "darwin":
        data_dir = _get_macos_app_data_dir()
    else:
        raise RuntimeError(f"Unsupported platform: {platform}")

    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def get_whombat_settings_file() -> Path:
    """Get the path to the Whombat settings file."""
    return get_app_data_dir() / "settings.json"


def get_whombat_db_file() -> Path:
    """Get the path to the Whombat database file."""
    return get_app_data_dir() / "whombat.db"
