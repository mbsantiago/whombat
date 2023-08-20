"""Whombat REST API routes."""

from fastapi import APIRouter

from whombat.dependencies import Session
from whombat.routers.api.tags import tags_router

__all__ = [
    "api_router",
]


api_router = APIRouter()
api_router.include_router(tags_router, prefix="/tags", tags=["tags"])


@api_router.get("/users")
async def get_users(session: Session):
    """Get all users."""
    from whombat import api

    return await api.users.get_many(session, limit=-1)
