"""Authentication dependencies."""
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi_users import FastAPIUsers

from whombat import models, schemas
from whombat.routes.dependencies.session import Session
from whombat.routes.dependencies.settings import WhombatSettings
from whombat.routes.dependencies.users import get_user_manager
from whombat.system import auth


async def auth_strategy(
    session: Session,
):
    """Get the authentication strategy."""
    token_db = auth.get_access_token_db(session)
    return auth.get_database_strategy(token_db)


def get_auth_backend(
    settings: WhombatSettings,
):
    """Get the authentication strategy."""
    return auth.get_auth_backend(
        settings,
        auth_strategy,
    )


def get_users_api(settings: WhombatSettings):
    """Get the users API."""
    auth_backend = get_auth_backend(settings)
    return FastAPIUsers[models.User, UUID](  # type: ignore
        get_user_manager,  # type: ignore
        [auth_backend],
    )


async def get_current_user(
    settings: WhombatSettings,
) -> schemas.SimpleUser:
    """Get the current user."""
    fastapi_users = get_users_api(settings)
    current_active_user = fastapi_users.current_user(active=True)
    return schemas.SimpleUser.model_validate(current_active_user)


ActiveUser = Annotated[schemas.SimpleUser, Depends(get_current_user)]
