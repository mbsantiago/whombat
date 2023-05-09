"""Module containing the router for the Auth."""
import uuid

from fastapi import APIRouter
from fastapi_users import FastAPIUsers

from whombat.database import models
from whombat.routers.auth.backends import db_auth_backend
from whombat.routers.deps import get_user_manager
from whombat.schemas.users import UserCreate, User, UserUpdate

__all__ = [
    "auth_router",
    "users_router",
]

auth_router = APIRouter()
users_router = APIRouter()


fastapi_users = FastAPIUsers[models.User, uuid.UUID](  # type: ignore
    get_user_manager,
    [db_auth_backend],
)

# Routes for Authentification
auth_router.include_router(
    fastapi_users.get_auth_router(db_auth_backend),
)
auth_router.include_router(
    fastapi_users.get_register_router(User, UserCreate),
)
auth_router.include_router(
    fastapi_users.get_reset_password_router(),
)
auth_router.include_router(
    fastapi_users.get_verify_router(User),
    tags=["auth"],
)

# Routes for user management
users_router.include_router(
    fastapi_users.get_users_router(User, UserUpdate),
)
