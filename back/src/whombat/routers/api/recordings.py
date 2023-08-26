"""REST API routes for recordings."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.recordings import RecordingFilter
from whombat.dependencies import Session
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
    filter: RecordingFilter = Depends(RecordingFilter),  # type: ignore
):
    """Get a page of datasets."""
    datasets, total = await api.recordings.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
    )
    return schemas.Page(
        items=datasets,
        total=total,
        offset=offset,
        limit=limit,
    )
