import datetime
from pathlib import Path
from uuid import UUID

from soundevent.io.aoef import ModelRunObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.clip_predictions import get_clip_predictions
from whombat.api.io.aoef.clips import get_clips
from whombat.api.io.aoef.features import get_feature_names
from whombat.api.io.aoef.recordings import get_recordings
from whombat.api.io.aoef.sound_event_predictions import (
    get_sound_event_predictions,
)
from whombat.api.io.aoef.sound_events import get_sound_events
from whombat.api.io.aoef.tags import import_tags
from whombat.api.io.aoef.users import import_users


async def import_model_run(
    session: AsyncSession,
    data: dict,
    audio_dir: Path,
    base_audio_dir: Path,
) -> models.ModelRun:
    """Import model run."""
    if not isinstance(data, dict):
        raise TypeError(f"Expected dict, got {type(data)}")

    if "data" not in data:
        raise ValueError("Missing 'data' key")

    obj = ModelRunObject.model_validate(data["data"])

    model_run = await get_or_create_model_run(session, obj)

    tags = await import_tags(session, obj.tags or [])
    users = await import_users(session, obj.users or [])
    feature_names = await get_feature_names(
        session,
        obj,
    )
    recordings = await get_recordings(
        session,
        obj,
        tags=tags,
        users=users,
        feature_names=feature_names,
        audio_dir=audio_dir,
        base_audio_dir=base_audio_dir,
        should_import=False,
    )
    clips = await get_clips(
        session,
        obj,
        recordings=recordings,
        feature_names=feature_names,
        should_import=False,
    )
    sound_events = await get_sound_events(
        session,
        obj,
        recordings=recordings,
        feature_names=feature_names,
    )
    clip_predictions = await get_clip_predictions(
        session,
        obj,
        clips=clips,
        tags=tags,
    )
    await get_sound_event_predictions(
        session,
        obj,
        sound_events=sound_events,
        clip_predictions=clip_predictions,
        tags=tags,
    )

    await _create_model_run_predictions(
        session,
        obj,
        model_run,
        clip_predictions,
    )

    return model_run


async def get_or_create_model_run(
    session: AsyncSession,
    obj: ModelRunObject,
) -> models.ModelRun:
    stmt = select(models.ModelRun).where(models.ModelRun.uuid == obj.uuid)
    result = await session.execute(stmt)
    row = result.one_or_none()
    if row is not None:
        return row[0]

    db_obj = models.ModelRun(
        uuid=obj.uuid,
        name=obj.name,
        version=obj.version or "",
        description=obj.description or "",
        created_on=obj.created_on or datetime.datetime.now(),
    )
    session.add(db_obj)
    await session.flush()
    return db_obj


async def _create_model_run_predictions(
    session: AsyncSession,
    obj: ModelRunObject,
    model_run: models.ModelRun,
    clip_predictions: dict[UUID, int],
):
    evalset_clip_predictions = obj.clip_predictions or []
    if not evalset_clip_predictions:
        return

    values = []
    for clip_prediction in evalset_clip_predictions:
        clip_prediction_db_id = clip_predictions.get(clip_prediction.uuid)

        if not clip_prediction_db_id:
            continue

        values.append(
            {
                "model_run_id": model_run.id,
                "clip_prediction_id": clip_prediction_db_id,
                "created_on": datetime.datetime.now(),
            }
        )

    if not values:
        return

    stmt = select(
        models.ModelRunPrediction.model_run_id,
        models.ModelRunPrediction.clip_prediction_id,
    ).where(
        tuple_(
            models.ModelRunPrediction.model_run_id,
            models.ModelRunPrediction.clip_prediction_id,
        ).in_({(v["model_run_id"], v["clip_prediction_id"]) for v in values})
    )
    result = await session.execute(stmt)
    existing = set(result.all())

    missing = [
        v
        for v in values
        if (v["model_run_id"], v["clip_prediction_id"]) not in existing
    ]

    if not missing:
        return

    stmt = insert(models.ModelRunPrediction)
    await session.execute(stmt, missing)
