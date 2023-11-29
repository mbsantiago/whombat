"""Schemas for User objects."""

import uuid

from fastapi_users import schemas

from whombat.schemas.base import BaseSchema


class SimpleUser(BaseSchema):
    """Schema for User objects returned to the user."""

    id: uuid.UUID
    username: str
    name: str | None = None


class User(schemas.BaseUser[uuid.UUID]):
    """Schema for User objects returned to the user."""

    username: str
    name: str | None = None


class UserCreate(schemas.BaseUserCreate):
    """Schema for User objects created by the user."""

    username: str
    name: str | None = None


class UserUpdate(schemas.BaseUserUpdate):
    """Schema for User objects updated by the user."""

    username: str | None = None
    name: str | None = None
