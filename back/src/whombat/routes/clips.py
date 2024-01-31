"""REST API routes for clips."""

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.clips import ClipFilter
from whombat.filters.recordings import UUIDFilter as RecordingUUIDFilter
from whombat.routes.dependencies import Session
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
    recording_uuids = list(set(recording_uuid for recording_uuid, _ in data))
    recordings, _ = await api.recordings.get_many(
        session,
        filters=[
            RecordingUUIDFilter(
                isin=recording_uuids,
            )
        ],
        limit=None,
        sort_by=None,
    )
    recording_mapping = {recording.uuid: recording for recording in recordings}
    clips = await api.clips.create_many_without_duplicates(
        session,
        [
            dict(
                uuid=uuid4(),
                recording_id=recording_mapping[recording_uuid].id,
                start_time=clip.start_time,
                end_time=clip.end_time,
            )
            for (recording_uuid, clip) in data
        ],
        return_all=True,
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
