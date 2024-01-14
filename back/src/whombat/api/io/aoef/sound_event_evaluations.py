import datetime
from uuid import UUID

from soundevent.io.aoef import EvaluationObject
from soundevent.io.aoef.clip_evaluation import ClipEvaluationObject
from soundevent.io.aoef.match import MatchObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.common import get_mapping
from whombat.api.io.aoef.features import import_feature_names


async def get_sound_event_evaluations(
    session: AsyncSession,
    obj: EvaluationObject,
    clip_evaluations: dict[UUID, int],
    sound_event_predictions: dict[UUID, int],
    sound_event_annotations: dict[UUID, int],
    should_import: bool = True,
) -> dict[UUID, int]:
    matches = obj.matches or []
    clip_evals = obj.clip_evaluations or []
    if matches and should_import:
        (matches, clip_evaluation_uuids) = get_clip_evaluation_uuids(
            matches,
            clip_evals,
        )

        await import_sound_event_evaluations(
            session,
            matches,
            clip_evaluation_uuids,
            clip_evaluations=clip_evaluations,
            sound_event_predictions=sound_event_predictions,
            sound_event_annotations=sound_event_annotations,
        )

    uuids: set[UUID] = set()

    for clip_evaluation in obj.clip_evaluations or []:
        for sound_event_evaluation in clip_evaluation.matches or []:
            uuids.add(sound_event_evaluation)

    if not uuids:
        return {}

    return await get_mapping(session, uuids, models.SoundEventEvaluation)


async def import_sound_event_evaluations(
    session: AsyncSession,
    matches: list[MatchObject],
    clip_evaluation_uuids: list[UUID],
    clip_evaluations: dict[UUID, int],
    sound_event_predictions: dict[UUID, int],
    sound_event_annotations: dict[UUID, int],
) -> dict[UUID, int]:
    if not matches:
        return {}

    if not len(matches) == len(clip_evaluation_uuids):
        raise ValueError(
            "The number of matches and clip evaluation uuids must be equal."
        )

    mapping = await _create_sound_event_evaluations(
        session,
        matches,
        clip_evaluation_uuids,
        clip_evaluations=clip_evaluations,
        sound_event_predictions=sound_event_predictions,
        sound_event_annotations=sound_event_annotations,
    )

    await _create_sound_event_evaluation_metrics(
        session,
        matches,
        mapping,
    )

    return mapping


async def _create_sound_event_evaluations(
    session: AsyncSession,
    matches: list[MatchObject],
    clip_evaluation_uuids: list[UUID],
    clip_evaluations: dict[UUID, int],
    sound_event_predictions: dict[UUID, int],
    sound_event_annotations: dict[UUID, int],
) -> dict[UUID, int]:
    # Get existing by UUID
    mapping = await get_mapping(
        session,
        {match.uuid for match in matches},
        models.SoundEventEvaluation,
    )

    missing = [
        (match, eval_uuid)
        for match, eval_uuid in zip(matches, clip_evaluation_uuids)
        if match.uuid not in mapping
    ]

    if not missing:
        return mapping

    values = []
    for match, eval_uuid in missing:
        source_id = (
            None
            if not match.source
            else sound_event_predictions.get(match.source)
        )
        target_id = (
            None
            if not match.target
            else sound_event_annotations.get(match.target)
        )

        clip_evaluation_id = clip_evaluations.get(eval_uuid)
        if not clip_evaluation_id:
            continue

        values.append(
            {
                "uuid": match.uuid,
                "source_id": source_id,
                "target_id": target_id,
                "affinity": match.affinity,
                "score": match.score,
                "clip_evaluation_id": clip_evaluation_id,
                "created_on": datetime.datetime.now(),
            }
        )

    if not values:
        return mapping

    stmt = insert(models.SoundEventEvaluation)
    await session.execute(stmt, values)

    created = await get_mapping(
        session,
        {v["uuid"] for v in values},
        models.SoundEventEvaluation,
    )
    mapping.update(created)
    return mapping


async def _create_sound_event_evaluation_metrics(
    session: AsyncSession,
    matches: list[MatchObject],
    sound_event_evaluations: dict[UUID, int],
) -> None:
    values = []
    for match in matches:
        if not match.metrics:
            continue

        sound_event_evaluation_id = sound_event_evaluations.get(match.uuid)
        if not sound_event_evaluation_id:
            continue

        for name, value in match.metrics.items():
            values.append(
                {
                    "name": name,
                    "value": value,
                    "sound_event_evaluation_id": sound_event_evaluation_id,
                }
            )

    if not values:
        return

    names = {v["name"] for v in values}
    feature_names = await import_feature_names(session, list(names))

    values = [
        {
            "feature_name_id": feature_names[v["name"]],
            "value": v["value"],
            "sound_event_evaluation_id": v["sound_event_evaluation_id"],
            "created_on": datetime.datetime.now(),
        }
        for v in values
    ]

    stmt = select(
        models.SoundEventEvaluationMetric.sound_event_evaluation_id,
        models.SoundEventEvaluationMetric.feature_name_id,
    ).where(
        tuple_(
            models.SoundEventEvaluationMetric.sound_event_evaluation_id,
            models.SoundEventEvaluationMetric.feature_name_id,
        ).in_(
            (v["sound_event_evaluation_id"], v["feature_name_id"])
            for v in values
        )
    )
    results = await session.execute(stmt)
    existing = {(r[0], r[1]) for r in results.scalars().all()}

    missing = [
        v
        for v in values
        if (v["sound_event_evaluation_id"], v["feature_name_id"])
        not in existing
    ]

    if not missing:
        return

    stmt = insert(models.SoundEventEvaluationMetric)
    await session.execute(stmt, missing)


def get_clip_evaluation_uuids(
    matches: list[MatchObject],
    clip_evaluations: list[ClipEvaluationObject],
) -> tuple[list[MatchObject], list[UUID]]:
    mapping = {match.uuid: match for match in matches}

    maches = []
    clip_evaluation_uuids = []
    for clip_evaluation in clip_evaluations:
        if not clip_evaluation.matches:
            continue

        for sound_event_evaluation in clip_evaluation.matches:
            maches.append(mapping[sound_event_evaluation])
            clip_evaluation_uuids.append(clip_evaluation.uuid)

    return maches, clip_evaluation_uuids
