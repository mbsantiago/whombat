"""Module containing the router for the Auth."""
from fastapi import APIRouter

from whombat.dependencies.auth import fastapi_users
from whombat.schemas.users import User, UserUpdate

__all__ = [
    "users_router",
]


users_router = APIRouter()
users_router.include_router(fastapi_users.get_users_router(User, UserUpdate))
