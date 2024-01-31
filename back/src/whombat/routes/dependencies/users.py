"""User dependencies."""

from typing import AsyncGenerator

from fastapi import Depends

from whombat import models
from whombat.routes.dependencies.session import Session
from whombat.system.users import UserDatabase, UserManager

__all__ = [
    "get_user_manager",
    "get_user_db",
]


async def get_user_db(session: Session) -> AsyncGenerator[UserDatabase, None]:
    """Get the user database.""" ""
    yield UserDatabase(session, models.User)


async def get_user_manager(
    user_database: UserDatabase = Depends(get_user_db),
) -> AsyncGenerator[UserManager, None]:
    """Get a UserManager context."""
    yield UserManager(user_database)
