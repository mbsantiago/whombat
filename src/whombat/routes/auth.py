"""Module containing the router for the Auth."""
from fastapi import APIRouter

from whombat.dependencies.auth import auth_backend, fastapi_users
from whombat.schemas.users import User, UserCreate

__all__ = [
    "auth_router",
]

auth_router = APIRouter()
auth_router.include_router(fastapi_users.get_auth_router(auth_backend))
auth_router.include_router(fastapi_users.get_register_router(User, UserCreate))
auth_router.include_router(fastapi_users.get_reset_password_router())
auth_router.include_router(fastapi_users.get_verify_router(User))
