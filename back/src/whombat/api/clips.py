"""API functions for interacting with audio clips."""

from uuid import UUID
from typing import Sequence

from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import schemas
from whombat.api import common, features, recordings
from whombat.database import models
from whombat.filters.base import Filter

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
    clip = await common.get_object(
        session,
        models.Clip,
        models.Clip.uuid == uuid,
    )
    return schemas.Clip.model_validate(clip)


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
    clip = await common.get_object(session, models.Clip, models.Clip.id == id)
    return schemas.Clip.model_validate(clip)


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
    clips = await common.get_objects(
        session,
        models.Clip,
        limit=limit,
        offset=offset,
        filters=filters,
    )
    return [schemas.Clip.model_validate(clip) for clip in clips]


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
        name: await features.get_or_create_feature_name(
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
    # Make sure recording exists
    await recordings.get_recording_by_id(session, data.recording_id)

    clip = await common.create_object(session, models.Clip, data)
    clip_id = clip.id

    await _create_clip_features(session, [clip])

    session.expire(clip)
    return await get_clip_by_id(session, clip_id)


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
    clips = await common.create_objects_without_duplicates(
        session,
        model=models.Clip,
        data=data,
        key=lambda x: (x.recording_id, x.start_time, x.end_time),
        key_column=tuple_(
            models.Clip.recording_id,
            models.Clip.start_time,
            models.Clip.end_time,
        ),
    )

    if clips:
        await _create_clip_features(session, clips)

    clip_ids = [clip.id for clip in clips]
    session.expire_all()

    clips = await common.get_objects(
        session,
        models.Clip,
        limit=-1,
        filters=[models.Clip.id.in_(clip_ids)],
    )
    return [schemas.Clip.model_validate(clip) for clip in clips]


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
    await common.delete_object(session, models.Clip, models.Clip.id == clip_id)


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
    clip = await common.add_tag_to_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        tag_id,
    )
    return schemas.Clip.model_validate(clip)


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
    clip = await common.add_feature_to_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        feature_name_id,
        value,
    )
    return schemas.Clip.model_validate(clip)


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
    clip = await common.update_feature_on_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        feature_name_id,
        value,
    )
    return schemas.Clip.model_validate(clip)


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
    clip = await common.remove_tag_from_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        tag_id,
    )
    return schemas.Clip.model_validate(clip)


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
    clip = await common.remove_feature_from_object(
        session,
        models.Clip,
        models.Clip.id == clip_id,
        feature_name_id,
    )
    return schemas.Clip.model_validate(clip)
