"""REST API routes for annotation projects."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.annotation_projects import AnnotationProjectFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "annotation_projects_router",
]


annotation_projects_router = APIRouter()


@annotation_projects_router.get(
    "/",
    response_model=schemas.Page[schemas.AnnotationProject],
)
async def get_annotation_projects(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: AnnotationProjectFilter = Depends(AnnotationProjectFilter),  # type: ignore
):
    """Get a page of annotation projects."""
    projects, total = await api.annotation_projects.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
    )
    return schemas.Page(
        items=projects,
        total=total,
        limit=limit,
        offset=offset,
    )
