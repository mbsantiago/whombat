"""REST API routes for clips."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.clips import ClipFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "clips_router",
]


clips_router = APIRouter()


@clips_router.get(
    "/",
    response_model=schemas.Page[schemas.Clip],
)
async def get_clips(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: ClipFilter = Depends(ClipFilter),  # type: ignore
    sort_by: str = "-created_at",
):
    """Get a page of clips."""
    tasks, total = await api.clips.get_many(
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


@clips_router.post(
    "/",
    response_model=list[schemas.Clip],
)
async def create_clips(
    session: Session,
    data: list[schemas.ClipCreate],
):
    """Create multiple clips."""
    clips = await api.clips.create_many(
        session,
        data,
    )
    await session.commit()
    return clips


@clips_router.delete(
    "/detail/",
    response_model=schemas.Task,
)
async def delete_clip(
    session: Session,
    clip_id: int,
):
    """Delete a clip."""
    task = await api.clips.delete(session, clip_id)
    await session.commit()
    return task
