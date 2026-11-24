"""Module containing the router for the Auth."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_users import exceptions as fastapi_users_exceptions

from whombat.routes.dependencies.auth import get_users_api
from whombat.routes.dependencies.settings import WhombatSettings
from whombat.routes.dependencies.users import UserManager, get_user_manager
from whombat.schemas.users import User, UserCreate, UserUpdate

logger = logging.getLogger(__name__)

__all__ = [
    "get_users_router",
]


def get_users_router(settings: WhombatSettings) -> APIRouter:
    users_router = APIRouter()

    fastapi_users = get_users_api(settings)

    users_router.include_router(
        fastapi_users.get_users_router(User, UserUpdate)
    )

    @users_router.post("/first/", response_model=User)
    async def create_first_user(
        data: UserCreate,
        user_manager: Annotated[UserManager, Depends(get_user_manager)],
    ):
        """Create the first user."""
        if await user_manager.user_db.has_user():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="A first user has already been created.",
            )

        # This is the first user, so make them an admin
        data.is_superuser = True

        try:
            return await user_manager.create(data, safe=True)
        except fastapi_users_exceptions.UserAlreadyExists as error:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this username or email already exists.",
            ) from error
        except fastapi_users_exceptions.InvalidPasswordException as error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error.reason,
            ) from error
        except Exception as error:
            logger.exception("Unexpected first user creation failure")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create account.",
            ) from error

    return users_router
