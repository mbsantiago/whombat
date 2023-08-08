"""API functions to interact with sound events."""

from uuid import UUID

import sqlalchemy.orm as orm
from sqlalchemy import Select, select, tuple_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, geometries, schemas
from whombat.api.features import _get_or_create_feature_names
from whombat.api.tags import _get_or_create_tags
from whombat.core.common import remove_duplicates
from whombat.core.geometries import compute_geometry_features
from whombat.database import models
from whombat.filters.base import Filter

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


def _add_associated_objects_to_sound_event(query: Select) -> Select:
    """Get the base query for retrieving recordings.

    Preloads all features, notes and tags.
    """
    return query.options(
        orm.joinedload(models.SoundEvent.features).subqueryload(
            models.SoundEventFeature.feature_name
        ),
        orm.joinedload(models.SoundEvent.tags).subqueryload(
            models.SoundEventTag.tag
        ),
    )


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
        sound_event.features.append(models_feature)
        session.add(models_feature)

    if tags:
        db_tags = await _get_or_create_tags(session, tags)

        for tag in db_tags:
            models_tag = models.SoundEventTag(
                sound_event_id=sound_event.id,
                tag_id=tag.id,
            )
            sound_event.tags.append(models_tag)
            session.add(models_tag)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return _convert_sound_event_to_schema(sound_event)


async def create_sound_events(
    session: AsyncSession,
    recording: schemas.Recording,
    geometries: list[geometries.Geometry],
    features: list[list[schemas.Feature] | None] | None = None,
    tags: list[list[schemas.Tag] | None] | None = None,
) -> list[schemas.SoundEvent]:
    """Create multiple sound events."""
    if features is None:
        features = [None for _ in geometries]

    if tags is None:
        tags = [None for _ in geometries]

    sound_events = []
    for geometry, feature_list, tag_list in zip(geometries, features, tags):
        sound_event = await create_sound_event(
            session=session,
            recording=recording,
            geometry=geometry,
            features=feature_list,
            tags=tag_list,
        )
        sound_events.append(sound_event)

    return sound_events


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


def _convert_sound_event_to_schema(
    db_sound_event: models.SoundEvent,
) -> schemas.SoundEvent:
    geometry_type, geometry = geometries.validate_geometry(
        db_sound_event.geometry_type,
        db_sound_event.geometry,
    )
    return schemas.SoundEvent(
        uuid=db_sound_event.uuid,
        geometry_type=geometry_type,
        geometry=geometry,
        tags=[
            schemas.Tag(
                key=db_tag.tag.key,
                value=db_tag.tag.value,
            )
            for db_tag in db_sound_event.tags
        ],
        features=[
            schemas.Feature(
                name=db_feature.feature_name.name,
                value=db_feature.value,
            )
            for db_feature in db_sound_event.features
        ],
    )


async def get_sound_events(
    session: AsyncSession,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
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
    query = _add_associated_objects_to_sound_event(select(models.SoundEvent))
    query = query.order_by(models.SoundEvent.id)

    for filter in filters or []:
        query = filter.filter(query)

    query = query.limit(limit).offset(offset)
    result = await session.execute(query)
    db_sound_events = result.unique().scalars()

    ret = []
    for db_sound_event in db_sound_events:
        ret.append(_convert_sound_event_to_schema(db_sound_event))
    return ret


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
    query = _add_associated_objects_to_sound_event(select(models.SoundEvent))
    query = query.where(models.SoundEvent.uuid == uuid)
    result = await session.execute(query)
    db_sound_event = result.scalars().first()

    if db_sound_event is None:
        raise exceptions.NotFoundError(
            f"Sound event with UUID {uuid} does not exist in the database."
        )

    return _convert_sound_event_to_schema(db_sound_event)


async def delete_sound_event(
    session: AsyncSession,
    sound_event: schemas.SoundEvent,
) -> schemas.SoundEvent:
    """Delete a sound event.

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
    query = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid
    )
    result = await session.execute(query)
    db_sound_event = result.scalars().first()

    if db_sound_event is None:
        raise exceptions.NotFoundError(
            f"Sound event with UUID {sound_event.uuid} does not "
            "exist in the database."
        )

    await session.delete(db_sound_event)
    await session.commit()

    return _convert_sound_event_to_schema(db_sound_event)


async def add_tags_to_sound_event(
    session: AsyncSession,
    sound_event: schemas.SoundEvent,
    tags: list[schemas.Tag],
) -> schemas.SoundEvent:
    """Add tags to a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    sound_event : schemas.SoundEvent
        The sound event to update.
    tags : list[schemas.Tag]
        The tags to add to the sound event.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    query = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid
    )
    result = await session.execute(query)
    db_sound_event = result.scalars().first()
    if db_sound_event is None:
        raise exceptions.NotFoundError(
            "Sound event does not exist in the database."
        )

    db_tags = await _get_or_create_tags(session, tags)

    for db_tag in db_tags:
        if db_tag in db_sound_event.tags:
            continue

        tag = models.SoundEventTag(
            sound_event_id=db_sound_event.id,
            tag_id=db_tag.id,
        )
        session.add(tag)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return _convert_sound_event_to_schema(db_sound_event)


async def add_features_to_sound_event(
    session: AsyncSession,
    sound_event: schemas.SoundEvent,
    features: list[schemas.Feature],
) -> schemas.SoundEvent:
    """Add features to a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    sound_event : schemas.SoundEvent
        The sound event to update.
    features : list[schemas.Feature]
        The features to add to the sound event.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    query = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid
    )
    result = await session.execute(query)
    db_sound_event = result.scalars().first()
    if db_sound_event is None:
        raise exceptions.NotFoundError(
            "Sound event does not exist in the database."
        )

    feature_names = await _get_or_create_feature_names(
        session, [f.name for f in features]
    )

    for feature in features:
        feature_name = feature_names[feature.name]
        db_feature = models.SoundEventFeature(
            sound_event_id=db_sound_event.id,
            feature_name_id=feature_name.id,
            value=feature.value,
        )
        session.add(db_feature)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return _convert_sound_event_to_schema(db_sound_event)


async def remove_tags_from_sound_event(
    session: AsyncSession,
    sound_event: schemas.SoundEvent,
    tags: list[schemas.Tag],
) -> schemas.SoundEvent:
    """Remove tags from a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    sound_event : schemas.SoundEvent
        The sound event to update.
    tags : list[schemas.Tag]
        The tags to remove from the sound event.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    query = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid
    )
    result = await session.execute(query)
    db_sound_event = result.scalars().first()
    if db_sound_event is None:
        raise exceptions.NotFoundError(
            "Sound event does not exist in the database."
        )

    query = (
        select(
            models.SoundEventTag,
        )
        .join(
            models.Tag,
        )
        .where(
            models.SoundEventTag.sound_event_id == db_sound_event.id,
            tuple_(models.Tag.key, models.Tag.value).in_(
                [(t.key, t.value) for t in tags]
            ),
        )
    )
    result = await session.execute(query)

    db_tags = result.scalars().all()
    for db_tag in db_tags:
        await session.delete(db_tag)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return _convert_sound_event_to_schema(db_sound_event)


async def remove_features_from_sound_event(
    session: AsyncSession,
    sound_event: schemas.SoundEvent,
    features: list[schemas.Feature],
) -> schemas.SoundEvent:
    """Remove features from a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    sound_event : schemas.SoundEvent
        The sound event to update.
    features : list[schemas.Feature]
        The features to remove from the sound event.

    Returns
    -------
    schemas.SoundEvent
        The updated sound event.

    Raises
    ------
    exceptions.NotFoundError
        If the sound event does not exist in the database.
    """
    query = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid
    )
    result = await session.execute(query)
    db_sound_event = result.scalars().first()
    if db_sound_event is None:
        raise exceptions.NotFoundError(
            "Sound event does not exist in the database."
        )

    query = (
        select(
            models.SoundEventFeature,
        )
        .join(models.FeatureName)
        .where(
            models.SoundEventFeature.sound_event_id == db_sound_event.id,
            models.FeatureName.name.in_([f.name for f in features]),
        )
    )

    result = await session.execute(query)
    db_features = result.scalars().all()

    for db_feature in db_features:
        await session.delete(db_feature)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise e

    return _convert_sound_event_to_schema(db_sound_event)
