"""Module containing the router for the Auth."""
from fastapi import APIRouter, Depends, HTTPException, status

from whombat.routes.dependencies.auth import fastapi_users
from whombat.routes.dependencies.users import UserManager, get_user_manager
from whombat.schemas.users import User, UserCreate, UserUpdate

__all__ = [
    "users_router",
]


users_router = APIRouter()
users_router.include_router(fastapi_users.get_users_router(User, UserUpdate))


@users_router.post("/first/", response_model=User)
async def create_first_user(
    data: UserCreate,
    user_manager: UserManager = Depends(get_user_manager),
):
    """Create the first user."""
    if await user_manager.user_db.has_user():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A first user has already been created.",
        )

    # This is the first user, so make them an admin
    data.is_superuser = True

    return await user_manager.create(data, safe=True)
