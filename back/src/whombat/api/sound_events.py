"""API functions to interact with sound events."""

import datetime
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import Select, insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, geometries, schemas
from whombat.api.recordings import (
    _add_associated_objects_to_recording,
    _convert_recording_to_schema,
)
from whombat.core.common import remove_duplicates
from whombat.database import models
from whombat.filters.base import Filter
from whombat.schemas.clips import ClipCreate

__all__ = [
    "create_sound_event",
    "create_sound_events",
    "get_sound_events",
    "get_sound_event_by_uuid",
    "delete_sound_event",
    "add_tag_to_sound_event",
    "add_feature_to_sound_event",
    "remove_tag_from_sound_event",
    "remove_feature_from_sound_event",
]


async def create_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
    geometry: geometries.Geometry,
):
    """Create a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    recording : schemas.Recording
        The recording to which the sound event belongs.
    geometry : geometries.Geometry
        The geometry of the sound event.

    Returns
    -------
    schemas.SoundEvent
        The created sound event.
    """
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    result = await session.execute(query)
    db_recording = result.scalars().first()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "Recording does not exist in the database."
        )

    sound_event = models.SoundEvent(
        geometry_type=geometry.type,
        geometry=geometry.json(),
        recording_id=db_recording.id,
    )

    try:
        session.add(sound_event)
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return schemas.SoundEvent(
        uuid=sound_event.uuid,
        geometry_type=geometry.type,
        geometry=geometry,
        tags=[],
        features=[],
    )


async def update_sound_event(
    session: AsyncSession,
    sound_event: schemas.SoundEvent,
    geometry: geometries.Geometry,
):
    """Update a sound event geometry.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    sound_event : schemas.SoundEvent
        The sound event to update.
    geometry : geometries.Geometry
        The new geometry of the sound event.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    ValueError
        If the geometry types do not match.
    """
    if sound_event.geometry_type != geometry.type:
        raise ValueError(
            "The geometry type of the sound event and the new geometry do not "
            "match."
        )

    query = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid
    )
    result = await session.execute(query)
    db_sound_event = result.scalars().first()
    if db_sound_event is None:
        raise exceptions.NotFoundError(
            "Sound event does not exist in the database."
        )

    db_sound_event.geometry = geometry.json()

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return schemas.SoundEvent(
        uuid=db_sound_event.uuid,
        geometry_type=geometry.type,
        geometry=geometry,
        tags=sound_event.tags,
        features=sound_event.features,
    )
