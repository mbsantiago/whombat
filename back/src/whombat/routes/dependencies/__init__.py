"""Common FastAPI dependencies for whombat."""

from whombat.routes.dependencies.auth import ActiveUser
from whombat.routes.dependencies.session import Session
from whombat.routes.dependencies.settings import WhombatSettings
from whombat.routes.dependencies.users import get_user_db, get_user_manager

__all__ = [
    "ActiveUser",
    "Session",
    "WhombatSettings",
    "get_user_db",
    "get_user_manager",
]
