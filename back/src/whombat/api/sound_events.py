"""API functions to interact with sound events."""

import datetime
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, geometries, schemas
from whombat.api.features import _get_or_create_feature_names
from whombat.core.common import remove_duplicates
from whombat.core.geometries import compute_geometry_features
from whombat.database import models
from whombat.filters.base import Filter
from whombat.schemas.clips import ClipCreate

__all__ = [
    "create_sound_event",
    "create_sound_events",
    "get_sound_events",
    "get_sound_event_by_uuid",
    "add_tags_to_sound_event",
    "add_features_to_sound_event",
    "remove_tags_from_sound_event",
    "remove_features_from_sound_event",
    "update_sound_event",
    "delete_sound_event",
]


async def create_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
    geometry: geometries.Geometry,
    features: list[schemas.Feature] | None = None,
    tags: list[schemas.Tag] | None = None,
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
    features : list[schemas.Feature], optional
        The features of the sound event, by default None. If None, only
        the geometry features are computed and stored.
    tags : list[schemas.Tag], optional
        The tags of the sound event, by default None. If None, no tags are
        added.

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

    if features is None:
        features = compute_geometry_features(geometry)
    else:
        features = remove_duplicates(
            compute_geometry_features(geometry) + features,
            key=lambda f: f.name,
        )

    sound_event = models.SoundEvent(
        geometry_type=geometry.type,
        geometry=geometry.model_dump_json(),
        recording_id=db_recording.id,
    )
    session.add(sound_event)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    feature_names = await _get_or_create_feature_names(
        session=session,
        feature_names=[f.name for f in features],
    )

    for feature in features:
        models_feature = models.SoundEventFeature(
            sound_event_id=sound_event.id,
            feature_name_id=feature_names[feature.name].id,
            value=feature.value,
        )
        session.add(models_feature)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return schemas.SoundEvent(
        uuid=sound_event.uuid,
        geometry_type=geometry.type,
        geometry=geometry,
        tags=[],
        features=features,
    )


async def create_sound_events(
    session: AsyncSession,
    recording: schemas.Recording,
    geometries: list[geometries.Geometry],
    tags: list[list[schemas.Tag]] | None = None,
    features: list[list[schemas.Feature]] | None = None,
):
    """Create a list of sound events.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    recording : schemas.Recording
        The recording to which the sound events belong.
    geometries : list[geometries.Geometry]
        The geometries of the sound events. A sound event is created for each
        geometry.
    tags : list[list[schemas.Tag]], optional
        The tags of the sound events. A list of tags is given for each sound
        event, by default None. If None, no tags are added to the sound events.
    features : list[list[schemas.Feature]], optional
        The features of the sound events. A list of features is given for each
        sound event, by default None. If None, no features are added to the
        sound events.
    """


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

    db_sound_event.geometry = geometry.model_dump_json()

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
