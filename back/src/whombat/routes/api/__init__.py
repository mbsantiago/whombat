"""Whombat REST API routes."""

from fastapi import APIRouter

from whombat.routes.api.annotation_projects import annotation_projects_router
from whombat.routes.api.datasets import dataset_router
from whombat.routes.api.recordings import recording_router
from whombat.routes.api.tags import tags_router

__all__ = [
    "api_router",
]


api_router = APIRouter()
api_router.include_router(
    tags_router,
    prefix="/tags",
    tags=["tags"],
)
api_router.include_router(
    dataset_router,
    prefix="/datasets",
    tags=["datasets"],
)
api_router.include_router(
    recording_router,
    prefix="/recordings",
    tags=["recordings"],
)
api_router.include_router(
    annotation_projects_router,
    prefix="/annotation_projects",
    tags=["annotation_projects"],
)
