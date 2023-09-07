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


@annotation_projects_router.post(
    "/",
    response_model=schemas.AnnotationProject,
)
async def create_annotation_project(
    session: Session,
    project: schemas.AnnotationProjectCreate,
):
    """Create an annotation project."""
    project = await api.annotation_projects.create(session, project)
    await session.commit()
    return project


@annotation_projects_router.get(
    "/detail/",
    response_model=schemas.AnnotationProject,
)
async def get_annotation_project(
    session: Session,
    annotation_project_id: int,
):
    """Get an annotation project."""
    project = await api.annotation_projects.get_by_id(
        session, annotation_project_id
    )
    return project


@annotation_projects_router.patch(
    "/detail/",
    response_model=schemas.AnnotationProject,
)
async def update_annotation_project(
    session: Session,
    annotation_project_id: int,
    data: schemas.AnnotationProjectUpdate,
):
    """Update an annotation project."""
    project = await api.annotation_projects.update(
        session, annotation_project_id, data
    )
    await session.commit()
    return project


@annotation_projects_router.delete(
    "/detail/",
    response_model=schemas.AnnotationProject,
)
async def delete_annotation_project(
    session: Session,
    annotation_project_id: int,
):
    """Delete an annotation project."""
    project = await api.annotation_projects.delete(
        session, annotation_project_id
    )
    await session.commit()
    return project


@annotation_projects_router.post(
    "/detail/tags/",
    response_model=schemas.AnnotationProject,
)
async def add_tag_to_annotation_project(
    session: Session,
    annotation_project_id: int,
    tag_id: int,
):
    """Add a tag to an annotation project."""
    project = await api.annotation_projects.add_tag(
        session, annotation_project_id, tag_id
    )
    await session.commit()
    return project


@annotation_projects_router.delete(
    "/detail/tags/",
    response_model=schemas.AnnotationProject,
)
async def remove_tag_from_annotation_project(
    session: Session,
    annotation_project_id: int,
    tag_id: int,
):
    """Remove a tag from an annotation project."""
    project = await api.annotation_projects.remove_tag(
        session, annotation_project_id, tag_id
    )
    await session.commit()
    return project
