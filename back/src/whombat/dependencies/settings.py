"""Settings dependencies."""
from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from whombat.settings import Settings

__all__ = [
    "get_settings",
    "WhombatSettings",
]


@lru_cache()
def get_settings() -> Settings:
    """Get the application settings."""
    return Settings()


WhombatSettings = Annotated[Settings, Depends(get_settings)]
