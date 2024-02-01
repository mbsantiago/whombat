"""Authentication dependencies."""

from uuid import UUID

from fastapi import Depends
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend

from whombat import models
from whombat.routes.dependencies.session import Session
from whombat.routes.dependencies.settings import WhombatSettings
from whombat.routes.dependencies.users import get_user_manager
from whombat.system import auth


def get_access_token_db(
    session: Session,
):
    """Get the access token database."""
    return auth.get_access_token_db(session)


async def get_database_strategy(
    token_db: auth.TokenDatabase = Depends(get_access_token_db),
):
    """Get the authentication strategy."""
    return auth.get_database_strategy(token_db)


def get_auth_backend(
    settings: WhombatSettings,
):
    """Get the authentication strategy."""
    cookie_transport = auth.get_cookie_transport(settings)
    return AuthenticationBackend(
        name="database",
        transport=cookie_transport,
        get_strategy=get_database_strategy,
    )


def get_users_api(settings: WhombatSettings):
    """Get the users API."""
    auth_backend = get_auth_backend(settings)
    return FastAPIUsers[models.User, UUID](  # type: ignore
        get_user_manager,
        [auth_backend],
    )


def get_current_user_dependency(
    settings: WhombatSettings,
):
    """Get the current user."""
    fastapi_users = get_users_api(settings)
    return fastapi_users.current_user(active=True)
