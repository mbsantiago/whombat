"""REST API routes for recordings."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.recordings import RecordingFilter
from whombat.routes.dependencies import Session, get_current_user_dependency
from whombat.routes.dependencies.settings import WhombatSettings
from whombat.routes.types import Limit, Offset

__all__ = [
    "get_recording_router",
]


def get_recording_router(settings: WhombatSettings) -> APIRouter:
    """Get the API router for recordings."""
    active_user = get_current_user_dependency(settings)

    recording_router = APIRouter()

    @recording_router.get(
        "/",
        response_model=schemas.Page[schemas.Recording],
        response_model_exclude_none=True,
    )
    async def get_recordings(
        session: Session,
        filter: Annotated[
            RecordingFilter,  # type: ignore
            Depends(RecordingFilter),
        ],
        limit: Limit = 10,
        offset: Offset = 0,
        sort_by: str = "-created_on",
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

    @recording_router.get(
        "/detail/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def get_recording(
        session: Session,
        recording_uuid: UUID,
    ):
        """Get a recording."""
        return await api.recordings.get(session, recording_uuid)

    @recording_router.patch(
        "/detail/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def update_recording(
        session: Session,
        recording_uuid: UUID,
        data: schemas.RecordingUpdate,
    ):
        """Update a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        response = await api.recordings.update(session, recording, data)
        await session.commit()
        return response

    # The rest of the routes remain unchanged...

    return recording_router
