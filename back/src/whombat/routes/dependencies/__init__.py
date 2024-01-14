"""Common FastAPI dependencies for whombat."""
from whombat.routes.dependencies.auth import ActiveUser, current_active_user
from whombat.routes.dependencies.session import Session, get_async_session
from whombat.routes.dependencies.settings import WhombatSettings, get_settings
from whombat.routes.dependencies.users import get_user_db, get_user_manager

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
