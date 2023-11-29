"""Authentication dependencies."""
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, CookieTransport
from fastapi_users.authentication.strategy.db import (
    AccessTokenDatabase,
    DatabaseStrategy,
)
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyAccessTokenDatabase,
)

from whombat import models
from whombat.dependencies.session import Session
from whombat.dependencies.users import get_user_manager

TokenDatabase = AccessTokenDatabase[models.AccessToken]  # type: ignore


async def get_access_token_db(session: Session):
    """Get the access token database."""
    yield SQLAlchemyAccessTokenDatabase(
        session,
        models.AccessToken,  # type: ignore
    )


def get_database_strategy(
    access_token_db: TokenDatabase = Depends(get_access_token_db),
) -> DatabaseStrategy:
    """Get the database strategy."""
    return DatabaseStrategy(
        access_token_db,  # type: ignore
        lifetime_seconds=3600,
    )


cookie_transport = CookieTransport(
    cookie_max_age=3600,
    cookie_name="whombatauth",
    cookie_secure=False,
    cookie_domain="0.0.0.0",
    cookie_samesite="lax",
)
"""We are using the cookie transport to store the access token in a cookie."""


auth_backend = AuthenticationBackend(
    name="database",
    transport=cookie_transport,
    get_strategy=get_database_strategy,
)
"""We are using the database authentication backend."""

fastapi_users = FastAPIUsers[models.User, UUID](  # type: ignore
    get_user_manager,  # type: ignore
    [auth_backend],
)
"""Fast API Users manager."""

current_active_user = fastapi_users.current_user(active=True)
"""The current active user."""


ActiveUser = Annotated[models.User, Depends(current_active_user)]
