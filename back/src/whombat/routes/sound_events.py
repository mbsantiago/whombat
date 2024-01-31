"""REST API routes for sound events."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.sound_events import SoundEventFilter
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

__all__ = [
    "sound_events_router",
]

sound_events_router = APIRouter()


@sound_events_router.get(
    "/detail/recording/",
    response_model=schemas.Recording,
)
async def get_sound_event_recording(
    session: Session,
    sound_event_uuid: UUID,
):
    """Get the recording for a sound_event."""
    sound_event = await api.sound_events.get(session, sound_event_uuid)
    return await api.sound_events.get_recording(session, sound_event)


@sound_events_router.get(
    "/",
    response_model=schemas.Page[schemas.SoundEvent],
)
async def get_sound_events(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_on",
    filter: SoundEventFilter = Depends(SoundEventFilter),  # type: ignore
):
    """Get a page of sound events."""
    datasets, total = await api.sound_events.get_many(
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


@sound_events_router.post(
    "/",
    response_model=schemas.SoundEvent,
)
async def create_sound_event(
    session: Session,
    recording_uuid: UUID,
    data: schemas.SoundEventCreate,
):
    """Create a sound_event."""
    recording = await api.recordings.get(session, recording_uuid)
    sound_event = await api.sound_events.create(
        session,
        recording,
        data.geometry,
    )
    await session.commit()
    return sound_event


@sound_events_router.get(
    "/detail/",
    response_model=schemas.SoundEvent,
)
async def get_sound_event(
    session: Session,
    sound_event_uuid: UUID,
):
    """Get a sound_event."""
    return await api.sound_events.get(session, sound_event_uuid)


@sound_events_router.patch(
    "/detail/",
    response_model=schemas.SoundEvent,
)
async def update_sound_event(
    session: Session,
    sound_event_uuid: UUID,
    data: schemas.SoundEventUpdate,
):
    """Update a sound_event."""
    sound_event = await api.sound_events.get(session, sound_event_uuid)
    response = await api.sound_events.update(session, sound_event, data)
    await session.commit()
    return response


@sound_events_router.post(
    "/detail/features/",
    response_model=schemas.SoundEvent,
)
async def add_sound_event_feature(
    session: Session,
    sound_event_uuid: UUID,
    name: str,
    value: float,
):
    """Add a feature to a sound_event."""
    sound_event = await api.sound_events.get(session, sound_event_uuid)
    feature = await api.features.get_feature(session, name=name, value=value)
    response = await api.sound_events.add_feature(
        session,
        sound_event,
        feature,
    )
    await session.commit()
    return response


@sound_events_router.delete(
    "/detail/features/",
    response_model=schemas.SoundEvent,
)
async def remove_sound_event_feature(
    session: Session,
    sound_event_uuid: UUID,
    name: str,
    value: float,
):
    """Remove a feature from a sound_event."""
    sound_event = await api.sound_events.get(session, sound_event_uuid)
    feature = await api.features.get_feature(session, name=name, value=value)
    response = await api.sound_events.remove_feature(
        session,
        sound_event,
        feature,
    )
    await session.commit()
    return response


@sound_events_router.patch(
    "/detail/features/",
    response_model=schemas.SoundEvent,
)
async def update_sound_event_feature(
    session: Session,
    sound_event_uuid: UUID,
    name: str,
    value: float,
):
    """Update a feature on a sound_event."""
    sound_event = await api.sound_events.get(session, sound_event_uuid)
    feature = await api.features.get_feature(session, name=name, value=value)
    response = await api.sound_events.update_feature(
        session,
        sound_event,
        feature,
    )
    await session.commit()
    return response
