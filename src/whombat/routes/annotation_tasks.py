"""REST API routes for annotation tasks."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends
from soundevent.data import AnnotationState

from whombat import api, schemas
from whombat.dependencies import ActiveUser, Session
from whombat.filters.annotation_tasks import AnnotationTaskFilter
from whombat.filters.clips import UUIDFilter as ClipUUIDFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "annotation_tasks_router",
]


annotation_tasks_router = APIRouter()


@annotation_tasks_router.post(
    "/",
    response_model=list[schemas.AnnotationTask],
)
async def create_tasks(
    session: Session,
    annotation_project_uuid: UUID,
    clip_uuids: list[UUID],
):
    """Create multiple annotation tasks."""
    annotation_project = await api.annotation_projects.get(
        session,
        annotation_project_uuid,
    )
    clips, _ = await api.clips.get_many(
        session,
        limit=-1,
        filters=[
            ClipUUIDFilter(
                isin=clip_uuids,
            ),
        ],
    )
    tasks = await api.annotation_tasks.create_many_without_duplicates(
        session,
        data=[
            dict(
                annotation_project_id=annotation_project.id,
                clip_id=clip.id,
            )
            for clip in clips
        ],
    )
    await session.commit()
    return tasks


@annotation_tasks_router.get(
    "/",
    response_model=schemas.Page[schemas.AnnotationTask],
)
async def get_tasks(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: AnnotationTaskFilter = Depends(AnnotationTaskFilter),  # type: ignore
    sort_by: str = "-created_on",
):
    """Get a page of annotation tasks."""
    tasks, total = await api.annotation_tasks.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tasks,
        total=total,
        limit=limit,
        offset=offset,
    )


@annotation_tasks_router.delete(
    "/detail/",
    response_model=schemas.AnnotationTask,
)
async def delete_task(
    session: Session,
    annotation_task_uuid: UUID,
):
    """Remove a clip from an annotation project."""
    annotation_task = await api.annotation_tasks.get(
        session,
        annotation_task_uuid,
    )
    annotation_task = await api.annotation_tasks.delete(
        session,
        annotation_task,
    )
    await session.commit()
    return annotation_task


@annotation_tasks_router.get(
    "/detail/",
    response_model=schemas.AnnotationTask,
)
async def get_task(
    session: Session,
    annotation_task_uuid: UUID,
):
    """Get an annotation task."""
    return await api.annotation_tasks.get(session, annotation_task_uuid)


@annotation_tasks_router.post(
    "/detail/badges/",
    response_model=schemas.AnnotationTask,
)
async def add_annotation_status_badge(
    session: Session,
    annotation_task_uuid: UUID,
    state: Annotated[AnnotationState, Body(embed=True)],
    user: ActiveUser,
):
    """Add a badge to an annotation task."""
    annotation_task = await api.annotation_tasks.get(
        session,
        annotation_task_uuid,
    )
    annotation_task = await api.annotation_tasks.add_status_badge(
        session,
        annotation_task,
        state,
        user,
    )
    await session.commit()
    return annotation_task


@annotation_tasks_router.delete(
    "/detail/badges/",
    response_model=schemas.AnnotationTask,
)
async def remove_annotation_status_badge(
    session: Session,
    annotation_task_uuid: UUID,
    state: Annotated[AnnotationState, Body(embed=True)],
    user: ActiveUser,
):
    """Remove a badge from an annotation task."""
    annotation_task = await api.annotation_tasks.get(
        session,
        annotation_task_uuid,
    )
    annotation_task = await api.annotation_tasks.remove_status_badge(
        session,
        annotation_task,
        state,
        user,
    )
    await session.commit()
    return annotation_task
