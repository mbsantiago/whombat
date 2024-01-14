from functools import lru_cache

from whombat.settings import Settings

__all__ = [
    "get_settings",
]

@lru_cache()
def get_settings() -> Settings:
    """Get the application settings."""
    return Settings()
