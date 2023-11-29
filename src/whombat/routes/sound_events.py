"""REST API routes for sound events."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.sound_events import SoundEventFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "sound_events_router",
]

sound_events_router = APIRouter()


@sound_events_router.get(
    "/",
    response_model=schemas.Page[schemas.SoundEvent],
)
async def get_sound_events(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
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


@sound_events_router.get(
    "/detail/",
    response_model=schemas.SoundEvent,
)
async def get_sound_event(
    session: Session,
    sound_event_id: int,
):
    """Get a sound_event."""
    return await api.sound_events.get_by_id(
        session,
        sound_event_id,
    )


@sound_events_router.patch(
    "/detail/",
    response_model=schemas.SoundEvent,
)
async def update_sound_event(
    session: Session,
    sound_event_id: int,
    sound_event: schemas.SoundEventUpdate,
):
    """Update a sound_event."""
    response = await api.sound_events.update(
        session,
        sound_event_id,
        sound_event,
    )
    await session.commit()
    return response


@sound_events_router.post(
    "/detail/tags/",
    response_model=schemas.SoundEvent,
)
async def add_sound_event_tag(
    session: Session,
    sound_event_id: int,
    tag_id: int,
):
    """Add a tag to a sound_event."""
    response = await api.sound_events.add_tag(
        session,
        sound_event_id,
        tag_id,
    )
    await session.commit()
    return response


@sound_events_router.delete(
    "/detail/tags/",
    response_model=schemas.SoundEvent,
)
async def remove_sound_event_tag(
    session: Session,
    sound_event_id: int,
    tag_id: int,
):
    """Remove a tag from a sound_event."""
    response = await api.sound_events.remove_tag(
        session,
        sound_event_id,
        tag_id,
    )
    await session.commit()
    return response


@sound_events_router.post(
    "/detail/features/",
    response_model=schemas.SoundEvent,
)
async def add_sound_event_feature(
    session: Session,
    sound_event_id: int,
    feature_name_id: int,
    value: float,
):
    """Add a feature to a sound_event."""
    response = await api.sound_events.add_feature(
        session,
        sound_event_id,
        feature_name_id,
        value,
    )
    await session.commit()
    return response


@sound_events_router.delete(
    "/detail/features/",
    response_model=schemas.SoundEvent,
)
async def remove_sound_event_feature(
    session: Session,
    sound_event_id: int,
    feature_name_id: int,
):
    """Remove a feature from a sound_event."""
    response = await api.sound_events.remove_feature(
        session,
        sound_event_id,
        feature_name_id,
    )
    await session.commit()
    return response


@sound_events_router.patch(
    "/detail/features/",
    response_model=schemas.SoundEvent,
)
async def update_sound_event_feature(
    session: Session,
    sound_event_id: int,
    feature_name_id: int,
    value: float,
):
    """Update a feature on a sound_event."""
    response = await api.sound_events.update_feature(
        session,
        sound_event_id,
        feature_name_id,
        value,
    )
    await session.commit()
    return response
