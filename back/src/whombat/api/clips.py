"""API functions for interacting with audio clips."""

import datetime
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import Select, insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api.recordings import (
    _add_associated_objects_to_recording,
    _convert_recording_to_schema,
)
from whombat.core.common import remove_duplicates
from whombat.database import models
from whombat.filters.base import Filter
from whombat.schemas.clips import ClipCreate

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


async def create_clip(
    session: AsyncSession,
    recording: schemas.Recording,
    start_time: float,
    end_time: float,
) -> schemas.Clip:
    """Create a clip from a recording.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    recording : schemas.Recording
        Recording to create clip from.
    start_time : float
        Start time of clip in seconds.
    end_time : float
        End time of clip in seconds.

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
    data = ClipCreate(
        recording_hash=recording.hash,
        start_time=start_time,
        end_time=end_time,
    )

    # get the recording
    recording_db = await session.execute(
        select(models.Recording).where(models.Recording.hash == recording.hash)
    )
    recording_db = recording_db.scalars().first()
    if not recording_db:
        raise exceptions.NotFoundError(
            "Recording is not in the database. Please add it first."
        )

    try:
        db_clip = models.Clip(
            recording_id=recording_db.id,
            start_time=data.start_time,
            end_time=data.end_time,
        )
        session.add(db_clip)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise exceptions.DuplicateObjectError(
            "Clip with same start and end time already exists "
            "for the recording."
        )

    await session.refresh(db_clip)
    uuid = db_clip.uuid

    return await add_feature_to_clip(
        session,
        schemas.Feature(name="duration", value=end_time - start_time),
        schemas.Clip(
            uuid=uuid,
            recording=recording,
            start_time=start_time,
            end_time=end_time,
        ),
    )


async def add_feature_to_clip(
    session: AsyncSession,
    feature: schemas.Feature,
    clip: schemas.Clip,
) -> schemas.Clip:
    """Add feature to clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    feature : schemas.Feature
        Feature to add to clip.
    clip : schemas.Clip
        Clip to add feature to.

    Returns
    -------
    schemas.Clip
        Updated clip.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If clip does not exist.

    """
    query = select(models.Clip).where(models.Clip.uuid == clip.uuid)
    result = await session.execute(query)
    db_clip = result.scalars().first()
    if not db_clip:
        raise exceptions.NotFoundError("Clip does not exist.")

    query = select(models.FeatureName).where(
        models.FeatureName.name == feature.name
    )
    result = await session.execute(query)
    db_feature_name = result.scalars().first()
    if not db_feature_name:
        db_feature_name = models.FeatureName(name=feature.name)
        session.add(db_feature_name)
        await session.commit()

    try:
        db_clip_feature = models.ClipFeature(
            clip_id=db_clip.id,
            feature_name_id=db_feature_name.id,
            value=feature.value,
        )
        session.add(db_clip_feature)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        return clip

    return schemas.Clip(
        **{
            **clip.model_dump(),
            "features": clip.features + [feature],
        }
    )


async def create_clips(
    session: AsyncSession,
    recordings: list[schemas.Recording],
    start_times: list[float],
    end_times: list[float],
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
    recordings : list[schemas.Recording]
        List of recordings to create clips from.
    start_times : list[float]
        List of start times of clips in seconds.
    end_times : list[float]
        List of end times of clips in seconds.

    Returns
    -------
    list[schemas.Clip]
        Created clips.

    Raises
    ------
    ValueError
        If the lists are not of the same length.
    whombat.exceptions.DuplicateObjectError
        If clip with same start and end time already exists for the recording.
    whombat.exceptions.NotFoundError
        If recording does not exist.

    """
    if not (len(recordings) == len(start_times) == len(end_times)):
        raise ValueError("The lists must be of the same length.")

    # Make sure there are no duplicates and remove invalid clips
    new_clips = remove_duplicates(
        [
            (recording, start_time, end_time)
            for recording, start_time, end_time in zip(
                recordings, start_times, end_times
            )
            if start_time <= end_time
        ],
        key=lambda x: (x[0].hash, x[1], x[2]),
    )

    # get the recordings
    recording_hashes = remove_duplicates(
        [recording.hash for recording in recordings]
    )
    query = select(models.Recording.id, models.Recording.hash).where(
        models.Recording.hash.in_(recording_hashes)
    )
    results = await session.execute(query)
    recording_ids = {
        recording_hash: recording_id
        for recording_id, recording_hash in results.all()
    }

    # Filter out recordings that are not in the database
    new_clips = [
        (recording, start_time, end_time)
        for recording, start_time, end_time in new_clips
        if recording.hash in recording_ids
    ]

    if not new_clips:
        # No new clips to create as all recordings are not in the database
        return []

    # Get existing clips
    query = select(models.Clip).where(
        models.Clip.recording_id.in_(recording_ids.values())
    )
    results = await session.execute(query)
    existing_clips = results.scalars().all()

    existing_clip_keys = set(
        (clip.recording_id, clip.start_time, clip.end_time)
        for clip in existing_clips
    )

    now = datetime.datetime.utcnow()

    # Filter out clips that already exist
    values = [
        {
            "recording_id": recording_ids[recording.hash],
            "start_time": start_time,
            "end_time": end_time,
            "uuid": uuid4(),
            "created_at": now,
        }
        for recording, start_time, end_time in new_clips
        if (recording_ids[recording.hash], start_time, end_time)
        not in existing_clip_keys
    ]

    if not values:
        # No new clips to create as all clips already exist
        return []

    # Create new clips in bulk
    stmt = insert(models.Clip).values(values)
    await session.execute(stmt)
    await session.commit()

    # Get new clips
    query = select(models.Clip).where(
        models.Clip.recording_id.in_(recording_ids.values()),
        models.Clip.id.notin_([clip.id for clip in existing_clips]),
    )
    results = await session.execute(query)
    new_clips = results.scalars().all()

    # Create features in bulk
    query = select(models.FeatureName).where(
        models.FeatureName.name == "duration"
    )
    results = await session.execute(query)
    duration_feature_name = results.scalars().first()
    if not duration_feature_name:
        duration_feature_name = models.FeatureName(name="duration")
        session.add(duration_feature_name)
        await session.commit()

    values = [
        {
            "clip_id": clip.id,
            "feature_name_id": duration_feature_name.id,
            "value": clip.end_time - clip.start_time,
            "created_at": now,
        }
        for clip in new_clips
    ]
    stmt = insert(models.ClipFeature).values(values)
    await session.execute(stmt)
    await session.commit()

    recording_mapping = {
        recording_ids[recording.hash]: recording for recording in recordings
    }

    return [
        schemas.Clip(
            uuid=clip.uuid,
            recording=recording_mapping[clip.recording_id],
            start_time=clip.start_time,
            end_time=clip.end_time,
            features=[
                schemas.Feature(
                    name="duration",
                    value=clip.end_time - clip.start_time,
                )
            ],
        )
        for clip in new_clips
    ]


def _add_associated_objects_to_clip(query: Select) -> Select:
    """Add associated objects to clip query."""
    return query.options(
        orm.joinedload(models.Clip.features).subqueryload(
            models.ClipFeature.feature_name
        ),
        orm.joinedload(models.Clip.tags).subqueryload(models.ClipTag.tag),
    )


def _convert_clip_to_schema(
    clip: models.Clip, recording: models.Recording
) -> schemas.Clip:
    """Convert clip database model to schema."""
    return schemas.Clip(
        uuid=clip.uuid,
        recording=_convert_recording_to_schema(recording),
        start_time=clip.start_time,
        end_time=clip.end_time,
        features=[
            schemas.Feature(
                name=feature.feature_name.name,
                value=feature.value,
            )
            for feature in clip.features
        ],
        tags=[
            schemas.Tag(
                key=tag.tag.key,
                value=tag.tag.value,
            )
            for tag in clip.tags
        ],
    )


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
    query = _add_associated_objects_to_clip(
        _add_associated_objects_to_recording(
            select(models.Clip, models.Recording).join(models.Recording)
        )
    )

    if filters:
        for filter in filters:
            query = filter.filter(query)

    query = query.limit(limit).offset(offset)

    result = await session.execute(query)

    clips = []
    for clip, recording in result.unique().all():
        clips.append(_convert_clip_to_schema(clip, recording))
    return clips


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
    query = _add_associated_objects_to_clip(
        _add_associated_objects_to_recording(
            select(models.Clip, models.Recording).join(models.Recording)
        )
    ).where(models.Clip.uuid == uuid)

    result = await session.execute(query)

    result = result.unique().all()
    if not result:
        raise exceptions.NotFoundError(f"Clip with UUID {uuid} not found")

    clip, recording = result[0]
    return _convert_clip_to_schema(clip, recording)


async def add_tag_to_clip(
    session: AsyncSession,
    tag: schemas.Tag,
    clip: schemas.Clip,
) -> schemas.Clip:
    """Add tag to clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    tag : schemas.Tag
        Tag to add to clip.
    clip : schemas.Clip
        Clip to add tag to.

    Returns
    -------
    schemas.Clip
        Clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    # Get clip from database
    query = select(models.Clip).where(models.Clip.uuid == clip.uuid)
    result = await session.execute(query)
    db_clip = result.scalars().first()
    if not db_clip:
        raise exceptions.NotFoundError(f"Clip with UUID {clip.uuid} not found")

    # Get tag from database or create
    db_tag = select(models.Tag).where(
        models.Tag.key == tag.key,
        models.Tag.value == tag.value,
    )
    result = await session.execute(db_tag)
    db_tag = result.scalars().first()
    if not db_tag:
        db_tag = models.Tag(key=tag.key, value=tag.value)
        session.add(db_tag)
        await session.commit()

    # Add tag to clip if it does not exist
    try:
        db_clip_tag = models.ClipTag(
            clip_id=db_clip.id,
            tag_id=db_tag.id,
        )
        session.add(db_clip_tag)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        return clip

    return schemas.Clip(
        **{
            **clip.model_dump(),
            "tags": clip.tags + [tag],
        }
    )


async def delete_clip(
    session: AsyncSession,
    clip: schemas.Clip,
) -> None:
    """Delete clip.

    This will also delete all associated tags and features.
    For this reason, it is recommended to delete clips using
    the `delete_clips` function.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    clip : schemas.Clip
        Clip to delete.

    Notes
    -----
    This function will not raise an error if the clip does not exist.

    """
    query = select(models.Clip).where(models.Clip.uuid == clip.uuid)
    result = await session.execute(query)
    db_clip = result.scalars().first()
    if not db_clip:
        return

    await session.delete(db_clip)
    await session.commit()


async def remove_tag_from_clip(
    session: AsyncSession,
    tag: schemas.Tag,
    clip: schemas.Clip,
) -> schemas.Clip:
    """Remove tag from clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    tag : schemas.Tag
        Tag to remove from clip.
    clip : schemas.Clip
        Clip to remove tag from.

    Returns
    -------
    schemas.Clip
        The updated clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    query = select(models.Clip).where(models.Clip.uuid == clip.uuid)
    result = await session.execute(query)
    db_clip = result.scalars().first()
    if not db_clip:
        raise exceptions.NotFoundError(f"Clip with UUID {clip.uuid} not found")

    db_clip_tag = (
        select(models.ClipTag)
        .join(models.ClipTag.tag)
        .where(
            models.ClipTag.clip_id == db_clip.id,
            models.Tag.key == tag.key,
            models.Tag.value == tag.value,
        )
    )
    result = await session.execute(db_clip_tag)
    db_clip_tag = result.scalars().first()
    if not db_clip_tag:
        return clip

    await session.delete(db_clip_tag)
    await session.commit()
    return schemas.Clip(
        **{
            **clip.model_dump(),
            "tags": [
                t
                for t in clip.tags
                if t.key != tag.key and t.value != tag.value
            ],
        }
    )


async def remove_feature_from_clip(
    session: AsyncSession,
    feature: schemas.Feature,
    clip: schemas.Clip,
) -> schemas.Clip:
    """Remove feature from clip.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    feature : schemas.Feature
        Feature to remove from clip.
    clip : schemas.Clip
        Clip to remove feature from.

    Returns
    -------
    schemas.Clip
        The updated clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    query = select(models.Clip).where(models.Clip.uuid == clip.uuid)
    result = await session.execute(query)
    db_clip = result.scalars().first()
    if not db_clip:
        raise exceptions.NotFoundError(f"Clip with UUID {clip.uuid} not found")

    db_clip_feature = (
        select(models.ClipFeature)
        .join(models.ClipFeature.feature_name)
        .where(
            models.ClipFeature.clip_id == db_clip.id,
            models.FeatureName.name == feature.name,
        )
    )
    result = await session.execute(db_clip_feature)
    db_clip_feature = result.scalars().first()
    if not db_clip_feature:
        return clip

    await session.delete(db_clip_feature)
    await session.commit()
    return schemas.Clip(
        **{
            **clip.model_dump(),
            "features": [f for f in clip.features if f.name != feature.name],
        }
    )


async def update_clip_feature(
    session: AsyncSession,
    clip: schemas.Clip,
    name: str,
    value: float,
) -> schemas.Clip:
    """Update a feature value for a clip.

    If the clip does not have the feature, it will be added.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    clip : schemas.Clip
        Clip to update.
    feature_name : str
        The name of the feature to update.
    value : float
        The value to update the feature to.

    Returns
    -------
    schemas.Clip
        The updated clip.

    Raises
    ------
    exceptions.NotFoundError
        Raised if clip does not exist in the database.

    """
    query = select(models.Clip).where(models.Clip.uuid == clip.uuid)
    result = await session.execute(query)
    db_clip = result.scalars().first()
    if not db_clip:
        raise exceptions.NotFoundError(f"Clip with UUID {clip.uuid} not found")

    db_feature_name = select(models.FeatureName).where(
        models.FeatureName.name == name,
    )
    result = await session.execute(db_feature_name)
    db_feature_name = result.scalars().first()
    if not db_feature_name:
        db_feature_name = models.FeatureName(name=name)
        session.add(db_feature_name)
        await session.commit()

    db_clip_feature = select(models.ClipFeature).where(
        models.ClipFeature.clip_id == db_clip.id,
        models.ClipFeature.feature_name_id == db_feature_name.id,
    )
    result = await session.execute(db_clip_feature)
    db_clip_feature = result.scalars().first()
    if not db_clip_feature:
        db_clip_feature = models.ClipFeature(
            clip_id=db_clip.id,
            feature_name_id=db_feature_name.id,
            value=value,
        )
        session.add(db_clip_feature)
        await session.commit()
    else:
        db_clip_feature.value = value
        await session.commit()

    for feature in clip.features:
        if feature.name == name:
            feature.value = value

    return clip
