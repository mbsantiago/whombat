"""Common FastAPI dependencies for whombat."""
from whombat.dependencies.auth import ActiveUser, current_active_user
from whombat.dependencies.users import get_user_db, get_user_manager
from whombat.dependencies.session import Session, get_async_session
from whombat.dependencies.settings import WhombatSettings, get_settings

__all__ = [
    "ActiveUser",
    "Session",
    "WhombatSettings",
    "current_active_user",
    "get_async_session",
    "get_settings",
    "get_user_db",
    "get_user_manager",
]
