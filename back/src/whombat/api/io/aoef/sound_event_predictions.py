import datetime
from uuid import UUID

from soundevent.io.aoef import EvaluationObject, PredictionSetObject
from soundevent.io.aoef.clip_predictions import ClipPredictionsObject
from soundevent.io.aoef.sound_event_prediction import (
    SoundEventPredictionObject,
)
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.common import get_mapping


async def get_sound_event_predictions(
    session: AsyncSession,
    obj: PredictionSetObject | EvaluationObject,
    sound_events: dict[UUID, int],
    clip_predictions: dict[UUID, int],
    tags: dict[int, int],
) -> dict[UUID, int]:
    sound_event_predictions = obj.sound_event_predictions or []
    clip_predictions_objs = obj.clip_predictions or []
    if sound_event_predictions:
        (
            sound_event_predictions,
            clip_prediction_uuids,
        ) = get_clip_predictions_uuids(
            sound_event_predictions,
            clip_predictions_objs,
        )

        return await import_sound_event_predictions(
            session,
            sound_event_predictions,
            clip_prediction_uuids,
            sound_events=sound_events,
            clip_predictions=clip_predictions,
            tags=tags,
        )

    uuids = set()
    for clip_prediction in clip_predictions_objs:
        if not clip_prediction.sound_events:
            continue

        for sound_event in clip_prediction.sound_events:
            uuids.add(sound_event)

    if isinstance(obj, EvaluationObject):
        for match in obj.matches or []:
            uuids.add(match.target)

    if not uuids:
        return {}

    return await get_mapping(session, uuids, models.SoundEventPrediction)


async def import_sound_event_predictions(
    session: AsyncSession,
    sound_events_predictions: list[SoundEventPredictionObject],
    clip_prediction_uuids: list[UUID],
    sound_events: dict[UUID, int],
    clip_predictions: dict[UUID, int],
    tags: dict[int, int],
) -> dict[UUID, int]:
    if not sound_events_predictions:
        return {}

    if not len(sound_events_predictions) == len(clip_prediction_uuids):
        raise ValueError(
            "The number of sound event predictions and clip prediction UUIDs "
            "must be equal."
        )

    mapping = await _create_sound_event_predictions(
        session=session,
        sound_events_predictions=sound_events_predictions,
        clip_prediction_uuids=clip_prediction_uuids,
        sound_events=sound_events,
        clip_predictions=clip_predictions,
    )

    await _create_sound_event_prediction_tags(
        session,
        sound_events_predictions,
        mapping,
        tags,
    )

    return mapping


async def _create_sound_event_predictions(
    session: AsyncSession,
    sound_events_predictions: list[SoundEventPredictionObject],
    clip_prediction_uuids: list[UUID],
    sound_events: dict[UUID, int],
    clip_predictions: dict[UUID, int],
) -> dict[UUID, int]:
    # Get existing by UUID
    mapping = await get_mapping(
        session,
        {s.uuid for s in sound_events_predictions},
        models.SoundEventPrediction,
    )

    missing = [
        (s, ca_uuid)
        for s, ca_uuid in zip(sound_events_predictions, clip_prediction_uuids)
        if s.uuid not in mapping
    ]
    if not missing:
        return mapping

    values = []
    for prediction, clip_prediction_uuid in missing:
        sound_event_db_id = sound_events.get(prediction.sound_event)
        if sound_event_db_id is None:
            # Skip predictions that do not have a sound event.
            continue

        clip_prediction_db_id = clip_predictions.get(clip_prediction_uuid)
        if clip_prediction_db_id is None:
            # Skip predictions that do not have a clip prediction.
            continue

        values.append(
            {
                "uuid": prediction.uuid,
                "sound_event_id": sound_event_db_id,
                "clip_prediction_id": clip_prediction_db_id,
                "score": prediction.score or 1,
                "created_on": datetime.datetime.now(),
            }
        )

    # If values is empty, then all possilbe predictions already exist in the
    # database.
    if not values:
        return mapping

    stmt = insert(models.SoundEventPrediction)
    await session.execute(stmt, values)

    # Get the IDs of the newly created predictions.
    created = await get_mapping(
        session,
        {v["uuid"] for v in values},
        models.SoundEventPrediction,
    )
    mapping.update(created)
    return mapping


async def _create_sound_event_prediction_tags(
    session: AsyncSession,
    sound_events_predictions: list[SoundEventPredictionObject],
    mapping: dict[UUID, int],
    tags: dict[int, int],
) -> None:
    """Create sound event prediction tags."""
    values = []
    for prediction in sound_events_predictions:
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
                    "score": score or 1,
                    "created_on": datetime.datetime.now(),
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
    await session.execute(stmt, values)


def get_clip_predictions_uuids(
    sound_event_predictions: list[SoundEventPredictionObject],
    clip_predictions: list[ClipPredictionsObject] | None,
) -> tuple[list[SoundEventPredictionObject], list[UUID]]:
    if clip_predictions is None:
        raise ValueError("Missing 'clip_predictions' key in prediction set.")

    mapping = {se.uuid: se for se in sound_event_predictions}
    sound_event_predictions = []
    clip_prediction_uuids = []
    for clip_prediction in clip_predictions:
        if not clip_prediction.sound_events:
            continue

        for sound_event in clip_prediction.sound_events:
            sound_event_predictions.append(mapping[sound_event])
            clip_prediction_uuids.append(clip_prediction.uuid)

    return sound_event_predictions, clip_prediction_uuids
