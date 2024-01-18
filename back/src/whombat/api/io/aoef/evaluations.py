import datetime
from pathlib import Path

from soundevent.io.aoef import EvaluationObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.clip_annotations import get_clip_annotations
from whombat.api.io.aoef.clip_evaluations import get_clip_evaluations
from whombat.api.io.aoef.clip_predictions import get_clip_predictions
from whombat.api.io.aoef.clips import get_clips
from whombat.api.io.aoef.features import (
    get_feature_names,
    import_feature_names,
)
from whombat.api.io.aoef.recordings import get_recordings
from whombat.api.io.aoef.sound_event_annotations import (
    get_sound_event_annotations,
)
from whombat.api.io.aoef.sound_event_evaluations import (
    get_sound_event_evaluations,
)
from whombat.api.io.aoef.sound_event_predictions import (
    get_sound_event_predictions,
)
from whombat.api.io.aoef.sound_events import get_sound_events
from whombat.api.io.aoef.tags import import_tags
from whombat.api.io.aoef.users import import_users


async def import_evaluation(
    session: AsyncSession,
    obj: dict,
    audio_dir: Path,
    base_audio_dir: Path,
) -> models.Evaluation:
    if not isinstance(obj, dict):
        raise TypeError(f"Expected dict, got {type(obj)}")

    if "data" not in obj:
        raise ValueError("Missing 'data' key")

    data = obj["data"]
    eval_obj = EvaluationObject.model_validate(data)

    tags = await import_tags(session, eval_obj.tags or [])
    users = await import_users(session, eval_obj.users or [])
    feature_names = await get_feature_names(
        session,
        eval_obj,
    )
    recordings = await get_recordings(
        session,
        eval_obj,
        tags=tags,
        users=users,
        feature_names=feature_names,
        audio_dir=audio_dir,
        base_audio_dir=base_audio_dir,
        should_import=False,
    )
    clips = await get_clips(
        session,
        eval_obj,
        recordings=recordings,
        feature_names=feature_names,
    )
    sound_events = await get_sound_events(
        session,
        eval_obj,
        recordings=recordings,
        feature_names=feature_names,
    )
    clip_annotations = await get_clip_annotations(
        session,
        eval_obj,
        clips=clips,
        users=users,
        tags=tags,
    )
    clip_predictions = await get_clip_predictions(
        session,
        eval_obj,
        clips=clips,
        tags=tags,
    )
    sound_event_annotations = await get_sound_event_annotations(
        session,
        eval_obj,
        sound_events=sound_events,
        clip_annotations=clip_annotations,
        users=users,
        tags=tags,
    )
    sound_event_predictions = await get_sound_event_predictions(
        session,
        eval_obj,
        sound_events=sound_events,
        clip_predictions=clip_predictions,
        tags=tags,
    )

    evaluation = await get_or_create_evaluation(session, eval_obj)
    clip_evaluations = await get_clip_evaluations(
        session,
        eval_obj,
        evaluation.id,
        clip_annotations=clip_annotations,
        clip_predictions=clip_predictions,
    )
    await get_sound_event_evaluations(
        session,
        eval_obj,
        clip_evaluations=clip_evaluations,
        sound_event_annotations=sound_event_annotations,
        sound_event_predictions=sound_event_predictions,
    )

    await add_evaluation_metrics(
        session,
        eval_obj,
        evaluation.id,
    )
    return evaluation


async def create_evaluation(
    session: AsyncSession,
    obj: EvaluationObject,
) -> models.Evaluation:
    db_obj = models.Evaluation(
        uuid=obj.uuid,
        task=obj.evaluation_task,
        score=obj.score or 0.0,
        created_on=obj.created_on or datetime.datetime.now(),
    )
    session.add(db_obj)
    await session.flush()
    return db_obj


async def get_evaluation(
    session: AsyncSession,
    obj: EvaluationObject,
) -> models.Evaluation | None:
    stmt = select(models.Evaluation).where(
        models.Evaluation.uuid == obj.uuid,
    )
    result = await session.execute(stmt)
    return result.scalars().first()


async def get_or_create_evaluation(
    session: AsyncSession,
    obj: EvaluationObject,
) -> models.Evaluation:
    db_obj = await get_evaluation(session, obj)
    if db_obj is not None:
        return db_obj
    return await create_evaluation(session, obj)


async def add_evaluation_metrics(
    session: AsyncSession,
    obj: EvaluationObject,
    evaluation_id: int,
) -> None:
    if not obj.metrics:
        return

    values = []
    for name, value in obj.metrics.items():
        values.append(
            {
                "name": name,
                "value": value,
                "evaluation_id": evaluation_id,
                "created_on": datetime.datetime.now(),
            }
        )

    names = {v["name"] for v in values}
    feature_names = await import_feature_names(session, list(names))

    values = [
        {
            "feature_name_id": feature_names[v["name"]],
            "value": v["value"],
            "evaluation_id": v["evaluation_id"],
            "created_on": datetime.datetime.now(),
        }
        for v in values
    ]

    stmt = select(
        models.EvaluationMetric.feature_name_id,
        models.EvaluationMetric.evaluation_id,
    ).where(
        tuple_(
            models.EvaluationMetric.feature_name_id,
            models.EvaluationMetric.evaluation_id,
        ).in_(
            {
                (
                    v["feature_name_id"],
                    v["evaluation_id"],
                )
                for v in values
            }
        )
    )
    result = await session.execute(stmt)
    existing = {r for r in result.all()}

    missing = [
        v
        for v in values
        if (v["feature_name_id"], v["evaluation_id"]) not in existing
    ]
    if not missing:
        return

    stmt = insert(models.EvaluationMetric)
    await session.execute(stmt, missing)
