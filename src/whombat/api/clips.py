"""API functions for interacting with audio clips."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data
from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import common, features, recordings
from whombat.filters.base import Filter

__all__ = [
    "add_feature",
    "add_tag",
    "create",
    "create_many",
    "delete",
    "get_by_uuid",
    "get_many",
    "remove_feature",
    "remove_tag",
    "update_feature",
]


clips_cache = cache.CacheCollection(schemas.Clip)


@clips_cache.cached(
    name="clip_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, uuid: uuid,
    data_key=lambda clip: clip.uuid,
)
async def get_by_uuid(
    session: AsyncSession,
    clip_uuid: UUID,
) -> schemas.Clip:
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
    clip = await common.get_object(
        session,
        models.Clip,
        models.Clip.uuid == clip_uuid,
    )
    return schemas.Clip.model_validate(clip)


@clips_cache.cached(
    name="clip_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, clip_id: clip_id,
    data_key=lambda clip: clip.id,
)
async def get_by_id(session: AsyncSession, clip_id: int) -> schemas.Clip:
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
    clip = await common.get_object(
        session, models.Clip, models.Clip.id == clip_id
    )
    return schemas.Clip.model_validate(clip)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.Clip], int]:
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

    sort_by : str, optional
        Sort clips by this column, by default "-created_at".

    Returns
    -------
    list[schemas.Clip]
        List of clips.
    count : int
        Total number of clips that match the filters.
    """
    clips, count = await common.get_objects(
        session,
        models.Clip,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [schemas.Clip.model_validate(clip) for clip in clips], count


@clips_cache.with_update
async def create(
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
    # Make sure recording exists
    await recordings.get_by_id(session, data.recording_id)

    clip = await common.create_object(session, models.Clip, data)
    clip_id = clip.id

    await _create_clip_features(session, [clip])

    session.expire(clip)
    return await get_by_id(session, clip_id)


async def create_many(
    session: AsyncSession,
    data: list[schemas.ClipCreate],
) -> list[schemas.Clip]:
    """Create multiple clips.

    Use this function to create multiple clips from multiple recordings
    at the same time. This is more efficient than calling `create_clip`
    multiple times.

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

    def get_key(
        x: schemas.ClipCreate | models.Clip,
    ) -> tuple[int, float, float]:
        return x.recording_id, x.start_time, x.end_time

    keys = {get_key(x) for x in data}

    clips = await common.create_objects_without_duplicates(
        session,
        model=models.Clip,
        data=data,
        key=get_key,
        key_column=tuple_(
            models.Clip.recording_id,
            models.Clip.start_time,
            models.Clip.end_time,
        ),
    )

    if clips:
        await _create_clip_features(session, clips)

    session.expire_all()

    clips, _ = await common.get_objects(
        session,
        models.Clip,
        limit=-1,
        filters=[
            tuple_(
                models.Clip.recording_id,
                models.Clip.start_time,
                models.Clip.end_time,
            ).in_(keys)
        ],
    )
    return [schemas.Clip.model_validate(clip) for clip in clips]


@clips_cache.with_clear
async def delete(
    session: AsyncSession,
    clip_id: int,
) -> schemas.Clip:
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
    obj = await common.delete_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
    )
    return schemas.Clip.model_validate(obj)


@clips_cache.with_update
async def add_tag(
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
    clip = await common.add_tag_to_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        tag_id,
    )
    return schemas.Clip.model_validate(clip)


@clips_cache.with_update
async def add_feature(
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
    clip = await common.add_feature_to_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        feature_name_id,
        value,
    )

    return schemas.Clip.model_validate(clip)


@clips_cache.with_update
async def update_feature(
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
    clip = await common.update_feature_on_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        feature_name_id,
        value,
    )
    return schemas.Clip.model_validate(clip)


@clips_cache.with_update
async def remove_tag(
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
    clip = await common.remove_tag_from_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        tag_id,
    )
    return schemas.Clip.model_validate(clip)


@clips_cache.with_update
async def remove_feature(
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
    clip = await common.remove_feature_from_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        feature_name_id,
    )
    return schemas.Clip.model_validate(clip)


async def _create_clip_features(
    session: AsyncSession,
    clips: Sequence[models.Clip],
) -> None:
    """Create features for clips.

    Parameters
    ----------
    session : AsyncSession
        Database session.
    clips : list[schemas.Clip]
        List of clips to create features for.
    """
    clip_features = [
        (clip.id, name, value)
        for clip in clips
        for name, value in compute_clip_features(clip).items()
    ]

    # Get feature names
    names = {name for _, name, _ in clip_features}

    feature_names: dict[str, schemas.FeatureName] = {
        name: await features.get_or_create(
            session, data=schemas.FeatureNameCreate(name=name)
        )
        for name in names
    }

    data = [
        schemas.ClipFeatureCreate(
            clip_id=clip_id,
            feature_name_id=feature_names[name].id,
            value=value,
        )
        for clip_id, name, value in clip_features
    ]

    await common.create_objects(session, models.ClipFeature, data)


DURATION = "duration"
"""Name of duration feature."""


def compute_clip_duration(clip: schemas.Clip | models.Clip) -> float:
    """Compute duration of clip.

    Parameters
    ----------
    clip : schemas.Clip
        Clip to compute duration for.

    Returns
    -------
    float
        Duration of clip.
    """
    return clip.end_time - clip.start_time


CLIP_FEATURES = {
    DURATION: compute_clip_duration,
}


def compute_clip_features(
    clip: schemas.Clip | models.Clip,
) -> dict[str, float]:
    """Compute features for clip.

    Parameters
    ----------
    clip : schemas.Clip
        Clip to compute features for.

    Returns
    -------
    dict[str, float]
        Dictionary of feature names and values.
    """
    return {name: func(clip) for name, func in CLIP_FEATURES.items()}


async def from_soundevent(
    session: AsyncSession,
    clip: data.Clip,
) -> schemas.Clip:
    """Create a clip from a soundevent Clip object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    clip : data.Clip
        The soundevent Clip object.

    Returns
    -------
    clip : schemas.Clip
        The created clip.
    """
    try:
        return await get_by_uuid(session, clip.uuid)
    except exceptions.NotFoundError:
        pass

    recording = await recordings.from_soundevent(session, clip.recording)

    return await create(
        session,
        schemas.ClipCreate(
            uuid=clip.uuid,
            recording_id=recording.id,
            start_time=clip.start_time,
            end_time=clip.end_time,
        ),
    )


def to_soundevent(
    clip: schemas.Clip,
) -> data.Clip:
    """Create a soundevent Clip object from a clip.

    Parameters
    ----------
    clip : schemas.Clip
        The clip.

    Returns
    -------
    clip : data.Clip
        The soundevent Clip object.
    """
    return data.Clip(
        uuid=clip.uuid,
        recording=recordings.to_soundevent(clip.recording),
        start_time=clip.start_time,
        end_time=clip.end_time,
    )
