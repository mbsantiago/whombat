"""API functions to interact with sound events."""

from typing import Sequence
from uuid import UUID

from soundevent.features import compute_geometric_features
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import schemas
from whombat.api import common, features
from whombat.database import models
from whombat.filters.base import Filter

__all__ = [
    "create_sound_event",
    "create_sound_events",
    "get_sound_events",
    "get_sound_event_by_uuid",
    "add_tag_to_sound_event",
    "add_feature_to_sound_event",
    "remove_tags_from_sound_event",
    "remove_features_from_sound_event",
    "update_sound_event",
    "delete_sound_event",
]


async def get_sound_event_by_id(
    session: AsyncSession,
    id: int,
) -> schemas.SoundEvent:
    """Get a sound event by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    id : int
        The ID of the sound event.

    Returns
    -------
    schemas.SoundEvent
        The sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    sound_event = await common.get_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.id == id,
    )
    return schemas.SoundEvent.model_validate(sound_event)


async def get_sound_event_by_uuid(
    session: AsyncSession,
    uuid: UUID,
) -> schemas.SoundEvent:
    """Get a sound event by its UUID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    uuid : UUID
        The UUID of the sound event.

    Returns
    -------
    schemas.SoundEvent
        The sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    sound_event = await common.get_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.uuid == uuid,
    )
    return schemas.SoundEvent.model_validate(sound_event)


async def get_sound_events(
    session: AsyncSession,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> list[schemas.SoundEvent]:
    """Get a list of sound events.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    limit : int, optional
        The maximum number of sound events to return, by default 1000.
    offset : int, optional
        The number of sound events to skip, by default 0.
    filters : list[Filter], optional
        A list of filters to apply to the sound events, by default None.

    Returns
    -------
    list[schemas.SoundEvent]
        The list of sound events.
    """
    sound_events = await common.get_objects(
        session=session,
        model=models.SoundEvent,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [schemas.SoundEvent.model_validate(s) for s in sound_events]


async def create_sound_event(
    session: AsyncSession,
    data: schemas.SoundEventCreate,
):
    """Create a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    data : schemas.SoundEventCreate
        The data of the sound event.

    Returns
    -------
    schemas.SoundEvent
        The created sound event.
    """
    await common.get_object(
        session=session,
        model=models.Recording,
        condition=models.Recording.id == data.recording_id,
    )
    sound_event = await common.create_object(
        session=session,
        model=models.SoundEvent,
        data=data,
    )
    await _create_sound_event_features(session, [sound_event])
    await session.refresh(sound_event)
    return schemas.SoundEvent.model_validate(sound_event)


async def create_sound_events(
    session: AsyncSession,
    data: list[schemas.SoundEventCreate],
) -> list[schemas.SoundEvent]:
    """Create multiple sound events."""
    sound_events = await common.create_objects_without_duplicates(
        session=session,
        model=models.SoundEvent,
        data=data,
        key=lambda x: x.uuid,
        key_column=models.SoundEvent.uuid,
    )

    await _create_sound_event_features(session, sound_events)

    sound_event_ids = [s.id for s in sound_events]

    sound_events = await common.get_objects(
        session=session,
        model=models.SoundEvent,
        limit=-1,
        filters=[models.SoundEvent.id.in_(sound_event_ids)],
    )
    return [schemas.SoundEvent.model_validate(s) for s in sound_events]


async def update_sound_event(
    session: AsyncSession,
    sound_event_id: int,
    data: schemas.SoundEventUpdate,
):
    """Update a sound event geometry.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    sound_event_id : int
        The ID of the sound event.

    data : schemas.SoundEventUpdate
        The data to update the sound event with.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.
    """
    sound_event = await common.update_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.id == sound_event_id,
        data=data,
    )

    if sound_event.geometry_type != data.geometry.type:
        await session.rollback()
        raise ValueError(
            "The geometry type of the sound event and the new geometry do not "
            "match."
        )

    new_features = compute_geometric_features(data.geometry)
    for feature in new_features:
        feature_name = await features.get_or_create_feature_name(
            session, data=schemas.FeatureNameCreate(name=feature.name)
        )
        await common.update_feature_on_object(
            session=session,
            model=models.SoundEvent,
            condition=models.SoundEvent.id == sound_event_id,
            feature_name_id=feature_name.id,
            value=feature.value,
        )

    await session.refresh(sound_event)
    return schemas.SoundEvent.model_validate(sound_event)


async def delete_sound_event(
    session: AsyncSession,
    sound_event_id: int,
) -> None:
    """Delete a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    sound_event_id : int
        The ID of the sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    await common.delete_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.id == sound_event_id,
    )


async def add_tag_to_sound_event(
    session: AsyncSession,
    sound_event_id: int,
    tag_id: int,
) -> schemas.SoundEvent:
    """Add tags to a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    sound_event_id : int
        The ID of the sound event.

    tag_id : int
        The ID of the tag.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    sound_event = await common.add_tag_to_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.id == sound_event_id,
        tag_id=tag_id,
    )
    return schemas.SoundEvent.model_validate(sound_event)


async def add_feature_to_sound_event(
    session: AsyncSession,
    sound_event_id: int,
    feature_name_id: int,
    value: float,
) -> schemas.SoundEvent:
    """Add features to a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    sound_event_id : int
        The ID of the sound event.

    feature_name_id : int
        The ID of the feature name.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    sound_event = await common.add_feature_to_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.id == sound_event_id,
        feature_name_id=feature_name_id,
        value=value,
    )
    return schemas.SoundEvent.model_validate(sound_event)


async def remove_tags_from_sound_event(
    session: AsyncSession,
    sound_event_id: int,
    tag_id: int,
) -> schemas.SoundEvent:
    """Remove tags from a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    sound_event_id : int
        The ID of the sound event.

    tag_id : int
        The ID of the tag.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    sound_event = await common.remove_tag_from_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.id == sound_event_id,
        tag_id=tag_id,
    )
    return schemas.SoundEvent.model_validate(sound_event)


async def remove_features_from_sound_event(
    session: AsyncSession,
    sound_event_id: int,
    features_name_id: int,
) -> schemas.SoundEvent:
    """Remove features from a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    sound_event_id : int
        The ID of the sound event.

    features_name_id : int
        The ID of the feature name.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    sound_event = await common.remove_feature_from_object(
        session=session,
        model=models.SoundEvent,
        condition=models.SoundEvent.id == sound_event_id,
        feature_name_id=features_name_id,
    )
    return schemas.SoundEvent.model_validate(sound_event)


async def _create_sound_event_features(
    session: AsyncSession,
    sound_events: Sequence[models.SoundEvent],
) -> None:
    """Create sound event features.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    sound_events : list[schemas.SoundEvent]
        The sound events.
    """
    all_features = []
    for sound_event in sound_events:
        feats = compute_geometric_features(sound_event.geometry)
        for feature in feats:
            all_features.append((sound_event.id, feature.name, feature.value))

    feature_names = {f[1] for f in all_features}
    feature_mapping = {
        name: await features.get_or_create_feature_name(
            session, data=schemas.FeatureNameCreate(name=name)
        )
        for name in feature_names
    }

    data = [
        schemas.SoundEventFeatureCreate(
            sound_event_id=sound_event_id,
            feature_name_id=feature_mapping[feature_name].id,
            value=value,
        )
        for sound_event_id, feature_name, value in all_features
    ]

    await common.create_objects(
        session,
        models.SoundEventFeature,
        data=data,
    )
