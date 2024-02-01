"""REST API routes for recordings."""

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
        limit: Limit = 10,
        offset: Offset = 0,
        sort_by: str = "-created_on",
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

    @recording_router.post(
        "/detail/tags/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def add_recording_tag(
        session: Session,
        recording_uuid: UUID,
        key: str,
        value: str,
    ):
        """Add a tag to a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        tag = await api.tags.get(session, (key, value))
        response = await api.recordings.add_tag(session, recording, tag)
        await session.commit()
        return response

    @recording_router.delete(
        "/detail/tags/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def remove_recording_tag(
        session: Session,
        recording_uuid: UUID,
        key: str,
        value: str,
    ):
        """Remove a tag from a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        tag = await api.tags.get(session, (key, value))
        response = await api.recordings.remove_tag(session, recording, tag)
        await session.commit()
        return response

    @recording_router.post(
        "/detail/notes/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def add_recording_note(
        session: Session,
        recording_uuid: UUID,
        data: schemas.NoteCreate,
        user: schemas.SimpleUser = Depends(active_user),
    ):
        """Add a note to a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        note = await api.notes.create(
            session,
            message=data.message,
            is_issue=data.is_issue,
            created_by=user,
        )
        response = await api.recordings.add_note(session, recording, note)
        await session.commit()
        return response

    @recording_router.delete(
        "/detail/notes/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def remove_recording_note(
        session: Session,
        recording_uuid: UUID,
        note_uuid: UUID,
    ):
        """Remove a note from a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        note = await api.notes.get(session, note_uuid)
        response = await api.recordings.remove_note(session, recording, note)
        await session.commit()
        return response

    @recording_router.post(
        "/detail/features/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def add_recording_feature(
        session: Session,
        recording_uuid: UUID,
        name: str,
        value: float,
    ):
        """Add a feature to a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        feature = await api.features.get_feature(
            session, name=name, value=value
        )
        response = await api.recordings.add_feature(
            session, recording, feature
        )
        await session.commit()
        return response

    @recording_router.delete(
        "/detail/features/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def remove_recording_feature(
        session: Session,
        recording_uuid: UUID,
        name: str,
        value: float,
    ):
        """Remove a feature from a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        feature = await api.features.get_feature(
            session, name=name, value=value
        )
        response = await api.recordings.remove_feature(
            session, recording, feature
        )
        await session.commit()
        return response

    @recording_router.patch(
        "/detail/features/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def update_recording_feature(
        session: Session,
        recording_uuid: UUID,
        name: str,
        value: float,
    ):
        """Update a feature on a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        feature = await api.features.get_feature(
            session, name=name, value=value
        )
        response = await api.recordings.update_feature(
            session,
            recording,
            feature,
        )
        await session.commit()
        return response

    @recording_router.delete(
        "/detail/",
        response_model=schemas.Recording,
        response_model_exclude_none=True,
    )
    async def delete_recording(
        session: Session,
        recording_uuid: UUID,
    ):
        """Delete a recording."""
        recording = await api.recordings.get(session, recording_uuid)
        await api.recordings.delete(session, recording)
        await session.commit()
        return recording

    return recording_router
