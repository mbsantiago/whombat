"""REST API routes for clips."""
from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.clips import ClipFilter
from whombat.filters.clips import UUIDFilter as ClipUUIDFilter
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
    sort_by: str = "-created_on",
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
    data: list[tuple[UUID, schemas.ClipCreate]],
):
    """Create multiple clips."""
    recordings, _ = await api.recordings.get_many(
        session,
        filters=[
            ClipUUIDFilter(isin=[recording_uuid for recording_uuid, _ in data])
        ],
        limit=None,
        sort_by=None,
    )
    clips = await api.clips.create_many_without_duplicates(
        session,
        [
            dict(
                recording_id=recording.id,
                start_time=clip.start_time,
                end_time=clip.end_time,
            )
            for (_, clip), recording in zip(data, recordings)
        ],
    )
    await session.commit()
    return clips


@clips_router.delete(
    "/detail/",
    response_model=schemas.Clip,
)
async def delete_clip(
    session: Session,
    clip_uuid: UUID,
):
    """Delete a clip."""
    clip = await api.clips.get(session, clip_uuid)
    clip = await api.clips.delete(session, clip)
    await session.commit()
    return clip
