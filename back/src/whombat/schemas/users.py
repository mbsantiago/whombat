"""Schemas for User objects."""

import uuid

from fastapi_users import schemas


class User(schemas.BaseUser[uuid.UUID]):
    """Schema for User objects returned to the user."""

    username: str
    name: str | None


class UserCreate(schemas.BaseUserCreate):
    """Schema for User objects created by the user."""

    username: str
    name: str | None


class UserUpdate(schemas.BaseUserUpdate):
    """Schema for User objects updated by the user."""

    username: str
    name: str | None
