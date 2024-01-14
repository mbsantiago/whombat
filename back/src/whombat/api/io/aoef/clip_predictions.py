import datetime
from uuid import UUID

from soundevent.io.aoef import EvaluationObject, PredictionSetObject
from soundevent.io.aoef.clip_predictions import ClipPredictionsObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.common import get_mapping


async def get_clip_predictions(
    session: AsyncSession,
    obj: PredictionSetObject | EvaluationObject,
    clips: dict[UUID, int],
    tags: dict[int, int],
) -> dict[UUID, int]:
    clip_predictions = obj.clip_predictions or []
    if clip_predictions:
        return await import_clip_predictions(
            session,
            clip_predictions,
            clips=clips,
            tags=tags,
        )

    if isinstance(obj, PredictionSetObject):
        return {}

    uuids = set()

    clip_evaluations = obj.clip_evaluations or []
    for evaluation in clip_evaluations:
        uuids.add(evaluation.predictions)

    if not uuids:
        return {}

    return await get_mapping(session, uuids, models.ClipPrediction)


async def import_clip_predictions(
    session: AsyncSession,
    clip_predictions: list[ClipPredictionsObject],
    clips: dict[UUID, int],
    tags: dict[int, int],
) -> dict[UUID, int]:
    if not clip_predictions:
        return {}

    mapping = await _create_clip_predictions(
        session=session,
        clip_predictions=clip_predictions,
        clips=clips,
    )

    await _create_clip_prediction_tags(
        session,
        clip_predictions,
        mapping,
        tags,
    )

    return mapping


async def _create_clip_predictions(
    session: AsyncSession,
    clip_predictions: list[ClipPredictionsObject],
    clips: dict[UUID, int],
) -> dict[UUID, int]:
    """Create clip predictions."""
    mapping = await get_mapping(
        session,
        {a.uuid for a in clip_predictions},
        models.ClipPrediction,
    )

    missing = [s for s in clip_predictions if s.uuid not in mapping]
    if not missing:
        return mapping

    values = []
    for prediction in missing:
        clip_db_id = clips.get(prediction.clip)
        if clip_db_id is None:
            continue

        values.append(
            {
                "uuid": prediction.uuid,
                "clip_id": clip_db_id,
                "created_on": datetime.datetime.now(),
            }
        )

    if not values:
        return mapping

    stmt = insert(models.ClipPrediction)
    await session.execute(stmt, values)

    created = await get_mapping(
        session,
        {v["uuid"] for v in values},
        models.ClipPrediction,
    )
    mapping.update(created)
    return mapping


async def _create_clip_prediction_tags(
    session: AsyncSession,
    clip_predictions: list[ClipPredictionsObject],
    mapping: dict[UUID, int],
    tags: dict[int, int],
) -> None:
    """Create clip prediction tags."""
    values = []
    for prediction in clip_predictions:
        prediction_db_id = mapping.get(prediction.uuid)
        if prediction_db_id is None:
            continue

        if not prediction.tags:
            continue

        for tag, score in prediction.tags:
            tag_db_id = tags.get(tag)
            if tag_db_id is None:
                continue

            values.append(
                {
                    "sound_event_prediction_id": prediction_db_id,
                    "tag_id": tag_db_id,
                    "created_on": datetime.datetime.now(),
                    "score": score or 1,
                }
            )

    if not values:
        return

    stmt = select(
        models.SoundEventPredictionTag.sound_event_prediction_id,
        models.SoundEventPredictionTag.tag_id,
    ).where(
        tuple_(
            models.SoundEventPredictionTag.sound_event_prediction_id,
            models.SoundEventPredictionTag.tag_id,
        ).in_({(v["sound_event_prediction_id"], v["tag_id"]) for v in values})
    )
    result = await session.execute(stmt)
    existing = set(result.all())

    missing = [
        v
        for v in values
        if (v["sound_event_prediction_id"], v["tag_id"]) not in existing
    ]

    if not missing:
        return

    stmt = insert(models.SoundEventPredictionTag)
    await session.execute(stmt, missing)
