"""Module containing the router for the Auth."""

from fastapi import APIRouter

from whombat.routes.dependencies.auth import get_auth_backend, get_users_api
from whombat.schemas.users import User, UserCreate
from whombat.system.settings import Settings

__all__ = [
    "get_auth_router",
]


def get_auth_router(settings: Settings) -> APIRouter:
    auth_router = APIRouter()
    auth_backend = get_auth_backend(settings)
    fastapi_users = get_users_api(settings)
    auth_router.include_router(fastapi_users.get_auth_router(auth_backend))
    auth_router.include_router(
        fastapi_users.get_register_router(User, UserCreate)
    )
    auth_router.include_router(fastapi_users.get_reset_password_router())
    auth_router.include_router(fastapi_users.get_verify_router(User))
    return auth_router
