import json
from typing import Any

from uvicorn.config import LOGGING_CONFIG

from whombat.system.data import get_app_data_dir
from whombat.system.settings import Settings


def get_logging_config(settings: Settings) -> dict[str, Any]:
    """Get the logging configuration.

    Will create the logging configuration file if it does not exist,
    otherwise it will read the configuration from the file.

    Parameters
    ----------
    settings: Settings
        The application settings.

    Returns
    -------
    dict[str, Any]
        The logging configuration.
    """
    if settings.debug:
        return generate_dev_logging_config(settings)

    data_dir = get_app_data_dir()
    log_config_file = data_dir / settings.log_config

    if not log_config_file.exists():
        config = generate_logging_config(settings)
        log_config_file.write_text(json.dumps(config, indent=4))

    return json.loads(log_config_file.read_text())


def generate_logging_config(settings: Settings) -> dict[str, Any]:
    """Generate the logging configuration.

    Parameters
    ----------
    settings: Settings
        The application settings.

    Returns
    -------
    dict[str, Any]
        The logging configuration.
    """

    data_dir = get_app_data_dir()
    log_dir = data_dir / settings.log_dir

    if not log_dir.exists():
        log_dir.mkdir(parents=True)

    default_log_file = log_dir / "default.log"
    whombat_log_file = log_dir / "whombat.log"
    access_log_file = log_dir / "access.log"
    error_log_file = log_dir / "error.log"

    if not default_log_file.exists():
        default_log_file.touch()

    if not whombat_log_file.exists():
        whombat_log_file.touch()

    if not access_log_file.exists():
        access_log_file.touch()

    if not error_log_file.exists():
        error_log_file.touch()

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            **LOGGING_CONFIG["formatters"],
            "whombat": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "default": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "default",
                "filename": str(default_log_file),
                "backupCount": 10,
                "maxBytes": 2 * 1024 * 1024,
            },
            "error": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "default",
                "filename": str(error_log_file),
                "backupCount": 10,
                "maxBytes": 2 * 1024 * 1024,
            },
            "access": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "access",
                "filename": str(access_log_file),
                "backupCount": 10,
                "maxBytes": 2 * 1024 * 1024,
            },
            "whombat": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "whombat",
                "filename": str(whombat_log_file),
                "backupCount": 10,
                "maxBytes": 2 * 1024 * 1024,
            },
        },
        "loggers": {
            "uvicorn": {
                "handlers": ["default"],
                "level": "info",
                "propagate": False,
            },
            "uvicorn.error": {
                "handlers": ["error"],
                "level": "info",
                "propagate": False,
            },
            "uvicorn.access": {
                "handlers": ["access"],
                "level": "info",
                "propagate": False,
            },
            "whombat": {
                "handlers": ["whombat"],
                "level": settings.log_level.lower(),
                "propagate": False,
            },
        },
    }


def generate_dev_logging_config(settings) -> dict[str, Any]:
    """Generate logging config for the development environment."""
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            **LOGGING_CONFIG["formatters"],
            "whombat": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
            "error": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stderr",
            },
            "access": {
                "formatter": "access",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
            "whombat": {
                "formatter": "whombat",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
        },
        "loggers": {
            "uvicorn": {
                "handlers": ["default"],
                "level": "info",
                "propagate": False,
            },
            "uvicorn.error": {
                "level": "info",
                "propagate": False,
                "handlers": ["error"],
            },
            "uvicorn.access": {
                "handlers": ["access"],
                "level": "info",
                "propagate": False,
            },
            "whombat": {
                "handlers": ["whombat"],
                "level": settings.log_level.lower(),
                "propagate": False,
            },
        },
    }
