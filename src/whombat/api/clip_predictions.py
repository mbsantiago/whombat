"""Python API for managing clip predictions."""


from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import clips, common, sound_event_predictions, tags
from whombat.filters.base import Filter

__all__ = [
    "get_by_id",
    "get_by_uuid",
    "get_many",
    "create",
    "delete",
    "add_tag",
    "remove_tag",
    "from_soundevent",
    "to_soundevent",
]

caches = cache.CacheCollection(schemas.ClipPrediction)


@caches.cached(
    name="clip_prediction_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, clip_prediction_id: clip_prediction_id,
    data_key=lambda clip_prediction: clip_prediction.id,
)
async def get_by_id(
    session: AsyncSession, clip_prediction_id: int,
) -> schemas.ClipPrediction:
    """Get a clip prediction by its ID.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    clip_prediction_id
        ID of the clip prediction to get.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Clip prediction with the given ID.
    """
    clip_prediction = await common.get_object(
        session,
        models.ClipPrediction,
        models.ClipPrediction.id == clip_prediction_id,
    )
    return schemas.ClipPrediction.model_validate(clip_prediction)


@caches.cached(
    name="clip_prediction_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, clip_prediction_uuid: clip_prediction_uuid,
    data_key=lambda clip_prediction: clip_prediction.uuid,
)
async def get_by_uuid(
    session: AsyncSession, clip_prediction_uuid: UUID,
) -> schemas.ClipPrediction:
    """Get a clip prediction by its UUID.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    clip_prediction_uuid
        UUID of the clip prediction to get.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
    """
    clip_prediction = await common.get_object(
        session,
        models.ClipPrediction,
        models.ClipPrediction.uuid == clip_prediction_uuid,
    )
    return schemas.ClipPrediction.model_validate(clip_prediction)


async def get_many(
    session: AsyncSession,
    *,
    limit: int | None = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.ClipPrediction], int]:
    """Get multiple clip predictions.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    limit
        Maximum number of clip predictions to get. By default, this is set
        to 1000. If None or negative, all clip predictions are returned.
    offset
        Offset of the clip predictions to get. By default, this is set to
        0.
    filters
        Filters to apply to the query, only clip predictions matching
        these filters are returned.
    sort_by
        Field to sort the clip predictions by. By default, this is set to
        "-created_on", which means that the clip predictions are sorted
        by their creation date in descending order.

    Returns
    -------
    clip_predictions : list[schemas.ClipPrediction]
        List of clip predictions matching the given criteria.
    total : int
        Total number of clip predictions matching the given criteria.
        This number may be larger than the number of clip predictions
        returned if the limit is set.
    """
    clip_predictions, total = await common.get_objects(
        session,
        models.ClipPrediction,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.ClipPrediction.model_validate(clip_prediction)
        for clip_prediction in clip_predictions
    ], total


@caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.ClipPredictionCreate,
) -> schemas.ClipPrediction:
    """Create a new clip prediction.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    data
        Data of the clip prediction to create.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Created clip prediction.
    """
    clip_prediction = common.create_object(
        session,
        models.ClipPrediction,
        data,
    )
    return schemas.ClipPrediction.model_validate(clip_prediction)


@caches.with_clear
async def delete(
    session: AsyncSession, clip_prediction_id: int
) -> schemas.ClipPrediction:
    """Delete a clip prediction.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    clip_prediction_id
        ID of the clip prediction to delete.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Deleted clip prediction.
    """
    clip_prediction = await common.delete_object(
        session,
        models.ClipPrediction,
        models.ClipPrediction.id == clip_prediction_id,
    )
    return schemas.ClipPrediction.model_validate(clip_prediction)


@caches.with_update
async def add_tag(
    session: AsyncSession,
    clip_prediction_id: int,
    tag_id: int,
    score: float,
) -> schemas.ClipPrediction:
    """Add a tag to a clip prediction.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    clip_prediction_id
        ID of the clip prediction to add the tag to.
    tag_id
        ID of the tag to add to the clip prediction.
    score
        Score of the tag.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Clip prediction with the added tag.
    """
    prediction = await common.get_object(
        session,
        models.ClipPrediction,
        models.ClipPrediction.id == clip_prediction_id,
    )

    for tag in prediction.tags:
        if tag.tag_id == tag_id:
            return schemas.ClipPrediction.model_validate(prediction)

    await common.create_object(
        session,
        models.ClipPredictionTag,
        schemas.ClipPredictionTagCreate(
            clip_prediction_id=clip_prediction_id,
            tag_id=tag_id,
            score=score,
        ),
    )

    await session.refresh(prediction)
    return schemas.ClipPrediction.model_validate(prediction)


@caches.with_update
async def remove_tag(
    session: AsyncSession,
    clip_prediction_id: int,
    tag_id: int,
) -> schemas.ClipPrediction:
    """Remove a tag from a clip prediction.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    clip_prediction_id
        ID of the clip prediction to remove the tag from.
    tag_id
        ID of the tag to remove from the clip prediction.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Clip prediction with the removed tag.
    """
    prediction = await common.get_object(
        session,
        models.ClipPrediction,
        models.ClipPrediction.id == clip_prediction_id,
    )

    for tag in prediction.tags:
        if tag.tag_id == tag_id:
            await common.delete_object(
                session,
                models.ClipPredictionTag,
                models.ClipPredictionTag.id == tag.id,
            )

    await session.refresh(prediction)
    return schemas.ClipPrediction.model_validate(prediction)


async def create_from_soundevent(
    session: AsyncSession,
    data: data.ClipPrediction,
) -> schemas.ClipPrediction:
    """Create a new clip prediction from an object in soundevent format.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    data
        Data of the clip prediction to create in soundevent format.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Created clip prediction.
    """
    clip = await clips.from_soundevent(
        session,
        data.clip,
    )

    clip_prediction = await create(
        session,
        schemas.ClipPredictionCreate(
            clip_id=clip.id,
            uuid=data.uuid,
        ),
    )

    return clip_prediction


async def update_from_soundevent(
    session: AsyncSession,
    clip_prediction: schemas.ClipPrediction,
    data: data.ClipPrediction,
) -> schemas.ClipPrediction:
    """Update a clip prediction from an object in soundevent format.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    clip_prediction
        Clip prediction to update.
    data
        Data of the clip prediction to update in soundevent format.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Updated clip prediction.
    """
    for sound_event in data.sound_events:
        await sound_event_predictions.from_soundevent(
            session,
            sound_event,
            clip_prediction_id=clip_prediction.id,
        )

    for predicted_tag in data.tags:
        tag = await tags.from_soundevent(
            session,
            predicted_tag.tag,
        )
        clip_prediction = await add_tag(
            session,
            clip_prediction.id,
            tag.id,
            predicted_tag.score,
        )

    return clip_prediction


async def from_soundevent(
    session: AsyncSession,
    data: data.ClipPrediction,
) -> schemas.ClipPrediction:
    """Create or update a clip prediction from an object in soundevent.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession to use for the database connection.
    data
        Data of the clip prediction to create or update in soundevent
        format.

    Returns
    -------
    clip_prediction : schemas.ClipPrediction
        Created or updated clip prediction.
    """
    try:
        clip_prediction = await get_by_uuid(session, data.uuid)
    except exceptions.NotFoundError:
        clip_prediction = await create_from_soundevent(session, data)

    clip_prediction = await update_from_soundevent(
        session, clip_prediction, data
    )
    return clip_prediction


def to_soundevent(
    clip_prediction: schemas.ClipPrediction,
) -> data.ClipPrediction:
    """Convert a clip prediction to an object in soundevent format.

    Parameters
    ----------
    clip_prediction
        Clip prediction to convert.

    Returns
    -------
    clip_prediction : data.ClipPrediction
        Converted clip prediction.
    """
    predicted_tags = [
        data.PredictedTag(
            tag=tags.to_soundevent(tag.tag),
            score=tag.score,
        )
        for tag in clip_prediction.predicted_tags
    ]
    sound_events = [
        sound_event_predictions.to_soundevent(prediction)
        for prediction in clip_prediction.sound_events
    ]
    return data.ClipPrediction(
        uuid=clip_prediction.uuid,
        clip=clips.to_soundevent(clip_prediction.clip),
        tags=predicted_tags,
        sound_events=sound_events,
    )
