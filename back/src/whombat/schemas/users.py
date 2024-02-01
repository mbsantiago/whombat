"""Schemas for User objects."""

import datetime
import uuid
from typing import Optional

from fastapi_users import schemas
from pydantic import EmailStr

from whombat.schemas.base import BaseSchema


class SimpleUser(BaseSchema):
    """Schema for User objects returned to the user."""

    id: uuid.UUID
    username: str
    email: EmailStr | None = None
    name: str | None = None
    is_active: bool | None = False
    is_superuser: bool | None = False
    is_verified: bool | None = False


class User(schemas.BaseUser[uuid.UUID]):
    """Schema for User objects returned to the user."""

    username: str
    name: Optional[str] = None
    created_on: datetime.datetime


class UserCreate(schemas.BaseUserCreate):
    """Schema for User objects created by the user."""

    username: str
    name: str | None = None


class UserUpdate(schemas.BaseUserUpdate):
    """Schema for User objects updated by the user."""

    username: str | None = None
    name: str | None = None
