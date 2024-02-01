"""Settings dependencies."""

from typing import Annotated

from fastapi import Depends

from whombat.system.settings import Settings, get_settings

__all__ = [
    "WhombatSettings",
]


WhombatSettings = Annotated[Settings, Depends(get_settings)]
