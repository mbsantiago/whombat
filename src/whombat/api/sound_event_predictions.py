"""Python API for interacting with Predictions."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common
from whombat.filters.base import Filter

__all__ = [
    "add_tag",
    "create",
    "delete",
    "get_by_id",
    "get_by_uuid",
    "get_many",
    "remove_tag",
    "from_soundevent",
    "to_soundevent",
]


caches = cache.CacheCollection(schemas.SoundEventPrediction)


@caches.cached(
    name="sound_event_prediction_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, sound_event_prediction_id: sound_event_prediction_id,
    data_key=lambda sound_event_prediction: sound_event_prediction.id,
)
async def get_by_id(
    session: AsyncSession,
    sound_event_id: int,
) -> schemas.SoundEventPrediction:
    """Get a sound event prediction by its ID.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    sound_event_id
        ID of the sound event prediction to get.

    Returns
    -------
    sound_event_prediction
        Sound event prediction with the given ID.

    Raises
    ------
    exceptions.NotFoundError
    """
    sound_event_prediction = await common.get_object(
        session,
        models.SoundEventPrediction,
        models.SoundEventPrediction.id == sound_event_id,
    )
    return schemas.SoundEventPrediction.model_validate(sound_event_prediction)


@caches.cached(
    name="sound_event_prediction_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, sound_event_uuid: sound_event_uuid,
    data_key=lambda sound_event_prediction: sound_event_prediction.uuid,
)
async def get_by_uuid(
    session: AsyncSession,
    sound_event_uuid: UUID,
) -> schemas.SoundEventPrediction:
    """Get a sound event prediction by its UUID.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    sound_event_uuid
        UUID of the sound event prediction to get.

    Returns
    -------
    sound_event_prediction
        Sound event prediction with the given UUID.

    Raises
    ------
    exceptions.NotFoundError
    """
    sound_event_prediction = await common.get_object(
        session,
        models.SoundEventPrediction,
        models.SoundEventPrediction.uuid == sound_event_uuid,
    )
    return schemas.SoundEventPrediction.model_validate(sound_event_prediction)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.SoundEventPrediction], int]:
    """Get multiple sound event predictions.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    limit
        Maximum number of sound event predictions to return.
    offset
        Number of sound event predictions to skip.
    filters
        Filters to apply to the query.
    sort_by
        Field to sort the sound event predictions by.

    Returns
    -------
    sound_event_predictions : list[schemas.SoundEventPrediction]
        List of sound event predictions.
    total : int
        Total number of sound event predictions. This number may be greater
        than the number of sound event predictions returned if `limit` is not
        `None`.
    """
    predictions, count = await common.get_objects(
        session,
        models.SoundEventPrediction,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.SoundEventPrediction.model_validate(ap) for ap in predictions
    ], count


@caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.SoundEventPredictionCreate,
) -> schemas.SoundEventPrediction:
    """Create a new sound event prediction.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    data
        Sound event prediction to create.

    Returns
    -------
    sound_event_prediction : schemas.SoundEventPrediction
        Created sound event prediction.
    """

    prediction = await common.create_object(
        session,
        models.SoundEventPrediction,
        data,
    )

    return schemas.SoundEventPrediction.model_validate(prediction)


@caches.with_clear
async def delete(
    session: AsyncSession,
    sound_event_prediction_id: int,
) -> schemas.SoundEventPrediction:
    """Delete a sound event prediction.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    sound_event_prediction_id
        ID of the sound event prediction to delete.

    Returns
    -------
    sound_event_prediction : schemas.SoundEventPrediction
        Deleted sound event prediction.
    """
    prediction = await common.delete_object(
        session,
        models.SoundEventPrediction,
        models.SoundEventPrediction.id == sound_event_prediction_id,
    )
    return schemas.SoundEventPrediction.model_validate(prediction)


@caches.with_update
async def add_tag(
    session: AsyncSession,
    sound_event_prediction_id: int,
    tag_id: int,
    score: float,
) -> schemas.SoundEventPrediction:
    """Add a tag to a sound event prediction.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    sound_event_prediction_id
        ID of the sound event prediction to add the tag to.
    tag_id
        ID of the tag to add.
    score
        Confidence score of the tag.

    Returns
    -------
    sound_event_prediction_tag : schemas.SoundEventPredictionTag
        Updated sound event prediction.
    """
    prediction = await common.get_object(
        session,
        models.SoundEventPrediction,
        models.SoundEventPrediction.id == sound_event_prediction_id,
    )

    for tag in prediction.predicted_tags:
        if tag.tag_id == tag_id:
            return schemas.SoundEventPrediction.model_validate(prediction)

    await common.create_object(
        session,
        models.SoundEventPredictionTag,
        schemas.SoundEventPredictionTagCreate(
            sound_event_prediction_id=sound_event_prediction_id,
            tag_id=tag_id,
            score=score,
        ),
    )

    await session.refresh(prediction)
    return schemas.SoundEventPrediction.model_validate(prediction)


@caches.with_update
async def remove_tag(
    session: AsyncSession,
    sound_event_prediction_id: int,
    tag_id: int,
) -> schemas.SoundEventPrediction:
    """Remove a tag from a sound event prediction.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    sound_event_prediction_id
        ID of the sound event prediction to remove the tag from.
    tag_id
        ID of the tag to remove.

    Returns
    -------
    sound_event_prediction : schemas.SoundEventPrediction
        The updated sound event prediction.
    """
    prediction = await common.get_object(
        session,
        models.SoundEventPrediction,
        models.SoundEventPrediction.id == sound_event_prediction_id,
    )

    for tag in prediction.predicted_tags:
        if tag.tag_id == tag_id:
            await session.delete(tag)
            await session.refresh(prediction)

    return schemas.SoundEventPrediction.model_validate(prediction)
