"""Filters for tags."""

from whombat.database import models
from whombat.filters import base

__all__ = [
    "KeyFilter",
    "ValueFilter",
    "SearchFilter",
]


KeyFilter = base.string_filter(models.Tag.key)
"""Filter tags by key."""

ValueFilter = base.string_filter(models.Tag.value)
"""Filter tags by value."""

SearchFilter = base.search_filter([models.Tag.key, models.Tag.value])
"""Search tags by key or value."""
