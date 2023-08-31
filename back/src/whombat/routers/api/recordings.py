"""REST API routes for recordings."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.recordings import RecordingFilter
from whombat.routers.types import Limit, Offset

__all__ = [
    "recording_router",
]

recording_router = APIRouter()


@recording_router.get(
    "/",
    response_model=schemas.Page[schemas.Recording],
)
async def get_recordings(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: RecordingFilter = Depends(RecordingFilter),  # type: ignore
):
    """Get a page of datasets."""
    datasets, total = await api.recordings.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=datasets,
        total=total,
        offset=offset,
        limit=limit,
    )


@recording_router.patch(
    "/detail/",
    response_model=schemas.Recording,
)
async def update_recording(
    session: Session,
    recording_id: int,
    recording: schemas.RecordingUpdate,
):
    """Update a recording."""
    response = await api.recordings.update(
        session,
        recording_id,
        recording,
    )
    await session.commit()
    return response


@recording_router.post(
    "/detail/tags/",
    response_model=schemas.Recording,
)
async def add_recording_tag(
    session: Session,
    recording_id: int,
    tag_id: int,
):
    """Add a tag to a recording."""
    response = await api.recordings.add_tag(
        session,
        recording_id,
        tag_id,
    )
    await session.commit()
    return response


@recording_router.delete(
    "/detail/tags/",
    response_model=schemas.Recording,
)
async def remove_recording_tag(
    session: Session,
    recording_id: int,
    tag_id: int,
):
    """Remove a tag from a recording."""
    response = await api.recordings.remove_tag(
        session,
        recording_id,
        tag_id,
    )
    await session.commit()
    return response
