"""Whombat REST API routes."""
from fastapi import APIRouter

from whombat.routes.api import api_router
from whombat.routes.auth import auth_router
from whombat.routes.users import users_router

__all__ = [
    "main_router",
]

main_router = APIRouter()
main_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["auth"],
)
main_router.include_router(
    users_router,
    prefix="/users",
    tags=["users"],
)
main_router.include_router(
    api_router,
    prefix="/api/v1",
    tags=["api"],
)
