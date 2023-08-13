"""API functions for interacting with audio clips."""

from uuid import UUID

from sqlalchemy import insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql._typing import _ColumnExpressionArgument

from whombat import exceptions, schemas
from whombat.api import recordings
from whombat.core.common import remove_duplicates
from whombat.database import models
from whombat.filters.base import Filter
from whombat.filters.clips import UUIDFilter

__all__ = [
    "add_feature_to_clip",
    "add_tag_to_clip",
    "create_clip",
    "create_clips",
    "delete_clip",
    "get_clip_by_uuid",
    "get_clips",
    "remove_feature_from_clip",
    "remove_tag_from_clip",
    "update_clip_feature",
]


async def _get_clip(
    session: AsyncSession,
    condition: _ColumnExpressionArgument,
) -> models.Clip:
    query = select(models.Clip).where(condition)
    result = await session.execute(query)
    clip = result.scalar_one_or_none()

    if clip is None:
        raise exceptions.NotFoundError(
            "A clip with the specified condition was not found"
        )

    return clip


async def get_clip_by_uuid(session: AsyncSession, uuid: UUID) -> schemas.Clip:
    """Get clip by UUID.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    uuid : UUID
        UUID of clip.

    Returns
    -------
    schemas.Clip
        The clip info.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip with UUID `uuid` is not found.

    """
    db_clip = await _get_clip(session, models.Clip.uuid == uuid)
    return schemas.Clip.model_validate(db_clip)


async def get_clip_by_id(session: AsyncSession, id: int) -> schemas.Clip:
    """Get clip by ID.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    id : int
        ID of clip.

    Returns
    -------
    schemas.Clip
        The clip info.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip with ID `id` is not found.

    """
    db_clip = await _get_clip(session, models.Clip.id == id)
    return schemas.Clip.model_validate(db_clip)


async def get_clips(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
) -> list[schemas.Clip]:
    """Get clips from the database.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    limit : int, optional
        Maximum number of clips to return, by default 1000.
        Set to -1 to return all clips.
    offset : int, optional
        Offset to start returning clips from, by default 0.
    filters : list[Filter], optional
        List of filters to apply, by default None.

    Returns
    -------
    list[schemas.Clip]
        List of clips.

    """
    query = select(models.Clip)

    for filter in filters or []:
        query = filter.filter(query)

    query = query.limit(limit).offset(offset)
    result = await session.execute(query)

    return [
        schemas.Clip.model_validate(clip) for clip in result.scalars().all()
    ]


async def create_clip(
    session: AsyncSession,
    data: schemas.ClipCreate,
) -> schemas.Clip:
    """Create a clip from a recording.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    data : schemas.ClipCreate
        Data to create clip from.

    Returns
    -------
    schemas.Clip
        Created clip.

    Raises
    ------
    whombat.exceptions.DuplicateObjectError
        If clip with same start and end time already exists for the recording.

    whombat.exceptions.NotFoundError
        If recording does not exist.

    """
    await recordings.get_recording_by_id(session, data.recording_id)

    db_clip = models.Clip(**data.model_dump(exclude_unset=True))
    session.add(db_clip)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise exceptions.DuplicateObjectError(
            "Clip with same start and end time already exists "
            "for the recording."
        )

    return await get_clip_by_id(session, db_clip.id)


async def create_clips(
    session: AsyncSession,
    data: list[schemas.ClipCreate],
) -> list[schemas.Clip]:
    """Create multiple clips.

    Use this function to create multiple clips from multiple recordings
    at the same time. This is more efficient than calling `create_clip`
    multiple times.

    The provided lists must be of the same length.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    data : list[schemas.ClipCreate]

    Returns
    -------
    list[schemas.Clip]
        Created clips. Note that clips that could not be created
        or already exist will not be returned.

    Raises
    ------
    ValueError
        If the lists are not of the same length.

    whombat.exceptions.DuplicateObjectError
        If clip with same start and end time already exists for the recording.

    whombat.exceptions.NotFoundError
        If recording does not exist.

    """
    # Make sure there are no duplicates
    new_clips = remove_duplicates(
        data,
        key=lambda x: (x.recording_id, x.start_time, x.end_time),
    )

    # get existing recordings
    recording_ids = remove_duplicates([clip.recording_id for clip in data])
    query = select(models.Recording.id).where(
        models.Recording.id.in_(recording_ids)
    )
    results = await session.execute(query)
    existing_recordings = results.scalars().all()

    # Filter out recordings that are not in the database
    new_clips = [
        clip for clip in data if clip.recording_id in existing_recordings
    ]

    if not new_clips:
        # No new clips to create, as none of the recordings exist
        return []

    # Get existing clips
    query = select(models.Clip).where(
        models.Clip.recording_id.in_(existing_recordings)
    )
    results = await session.execute(query)
    existing_clips = results.scalars().all()

    existing_clip_keys = set(
        (clip.recording_id, clip.start_time, clip.end_time)
        for clip in existing_clips
    )

    # Only create clips that do not already exist
    clips_to_create = [
        clip
        for clip in new_clips
        if (clip.recording_id, clip.start_time, clip.end_time)
        not in existing_clip_keys
    ]

    if not clips_to_create:
        # No new clips to create as all clips already exist
        return []

    # Get values to create new clips
    values = [clip.model_dump(exclude_unset=True) for clip in clips_to_create]

    # Create new clips in bulk
    stmt = insert(models.Clip).values(values)
    await session.execute(stmt)
    await session.commit()

    # Get new clips
    return await get_clips(
        session,
        filters=[UUIDFilter(isin=[clip.uuid for clip in clips_to_create])],
    )


async def delete_clip(
    session: AsyncSession,
    clip_id: int,
) -> None:
    """Delete clip.

    This will also delete all associated tags and features.
    For this reason, it is recommended to delete clips using
    the `delete_clips` function.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    clip_id : int
        Clip ID.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    db_clip = _get_clip(session, models.Clip.id == clip_id)
    await session.delete(db_clip)
    await session.commit()


async def add_tag_to_clip(
    session: AsyncSession,
    clip_id: int,
    tag_id: int,
) -> schemas.Clip:
    """Add tag to clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    clip_id : int
        ID of clip to add tag to.

    tag_id : int
        ID of tag to add to clip.

    Returns
    -------
    schemas.Clip
        Clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    db_clip = await _get_clip(session, models.Clip.id == clip_id)
    db_tag = await _get_tag(session, models.Tag.id == tag_id)
    db_clip.tags.append(db_tag)
    await session.commit()
    session.expire(db_clip)
    return await get_clip_by_id(session, clip_id)


async def add_feature_to_clip(
    session: AsyncSession,
    clip_id: int,
    feature_name_id: int,
    value: float,
) -> schemas.Clip:
    """Add feature to clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    clip_id : int
        ID of clip to add feature to.

    feature_name_id : int
        ID of feature name to add to clip.

    value : float
        Feature value.

    Returns
    -------
    schemas.Clip
        Updated clip.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If clip does not exist.

    """
    db_clip = await _get_clip(session, models.Clip.id == clip_id)
    db_feature = models.ClipFeature(
        clip_id=clip_id,
        feature_name_id=feature_name_id,
        value=value,
    )
    db_clip.features.append(db_feature)
    await session.commit()
    session.expire(db_clip)
    return await get_clip_by_id(session, clip_id)


async def update_clip_feature(
    session: AsyncSession,
    clip_id: int,
    feature_name_id: int,
    value: float,
) -> schemas.Clip:
    """Update a feature value for a clip.

    If the clip does not have the feature, it will be added.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    clip_id : int
        ID of clip to update feature for.

    feature_name_id : int
        ID of feature name to update.

    value : float
        New value for feature.

    Returns
    -------
    schemas.Clip
        The updated clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    db_clip = await _get_clip(session, models.Clip.id == clip_id)
    db_feature = next(
        (
            feature
            for feature in db_clip.features
            if feature.feature_name_id == feature_name_id
        ),
        None,
    )
    if db_feature:
        db_feature.value = value
    else:
        db_feature = models.ClipFeature(
            clip_id=clip_id,
            feature_name_id=feature_name_id,
            value=value,
        )
        db_clip.features.append(db_feature)
    await session.commit()
    session.expire(db_clip)
    return await get_clip_by_id(session, clip_id)


async def remove_tag_from_clip(
    session: AsyncSession,
    clip_id: int,
    tag_id: int,
) -> schemas.Clip:
    """Remove tag from clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    clip_id : int
        ID of clip to remove tag from.

    tag_id : int
        ID of tag to remove from clip.

    Returns
    -------
    schemas.Clip
        The updated clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    db_clip = await _get_clip(session, models.Clip.id == clip_id)
    db_tag = next((tag for tag in db_clip.tags if tag.id == tag_id), None)
    if db_tag is None:
        return schemas.Clip.model_validate(db_clip)
    db_clip.tags.remove(db_tag)
    await session.commit()
    session.expire(db_clip)
    return await get_clip_by_id(session, clip_id)


async def remove_feature_from_clip(
    session: AsyncSession,
    clip_id: int,
    feature_name_id: int,
) -> schemas.Clip:
    """Remove feature from clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.

    clip_id : int
        ID of clip to remove feature from.

    feature_name_id : int
        ID of feature name to remove from clip.

    Returns
    -------
    schemas.Clip
        The updated clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    db_clip = await _get_clip(session, models.Clip.id == clip_id)
    db_feature = next(
        (
            feature
            for feature in db_clip.features
            if feature.feature_name_id == feature_name_id
        ),
        None,
    )
    if db_feature is None:
        return schemas.Clip.model_validate(db_clip)
    db_clip.features.remove(db_feature)
    await session.commit()
    session.expire(db_clip)
    return await get_clip_by_id(session, clip_id)
