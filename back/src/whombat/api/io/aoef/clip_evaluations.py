import datetime
from uuid import UUID

from soundevent.io.aoef import EvaluationObject
from soundevent.io.aoef.clip_evaluation import ClipEvaluationObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.io.aoef.common import get_mapping
from whombat.api.io.aoef.features import import_feature_names


async def get_clip_evaluations(
    session: AsyncSession,
    obj: EvaluationObject,
    obj_id: int,
    clip_annotations: dict[UUID, int],
    clip_predictions: dict[UUID, int],
    should_import: bool = True,
) -> dict[UUID, int]:
    clip_evals = obj.clip_evaluations or []
    if obj.clip_evaluations and should_import:
        evaluation_uuids = [obj.uuid] * len(clip_evals)
        await import_clip_evaluations(
            session,
            clip_evals,
            evaluation_uuids,
            clip_annotations,
            clip_predictions,
            evaluations={obj.uuid: obj_id},
        )

    uuids: set[UUID] = set()

    for clip_evaluation in clip_evals:
        uuids.add(clip_evaluation.uuid)

    if not uuids:
        return {}

    return await get_mapping(session, uuids, models.ClipEvaluation)


async def import_clip_evaluations(
    session: AsyncSession,
    clip_evaluations: list[ClipEvaluationObject],
    evaluation_uuids: list[UUID],
    clip_annotations: dict[UUID, int],
    clip_predictions: dict[UUID, int],
    evaluations: dict[UUID, int],
) -> dict[UUID, int]:
    if not clip_evaluations:
        return {}

    if not len(clip_evaluations) == len(evaluation_uuids):
        raise ValueError(
            "The number of clip evaluations and evaluation uuids must be equal.",
        )

    mapping = await _create_clip_evaluations(
        session,
        clip_evaluations,
        evaluation_uuids,
        clip_annotations=clip_annotations,
        clip_predictions=clip_predictions,
        evaluations=evaluations,
    )

    await _create_clip_evaluation_metrics(
        session,
        clip_evaluations,
        mapping,
    )

    return mapping


async def _create_clip_evaluations(
    session: AsyncSession,
    clip_evaluations: list[ClipEvaluationObject],
    evaluations_uuids: list[UUID],
    clip_annotations: dict[UUID, int],
    clip_predictions: dict[UUID, int],
    evaluations: dict[UUID, int],
) -> dict[UUID, int]:
    mapping = await get_mapping(
        session,
        {clip_eval.uuid for clip_eval in clip_evaluations},
        models.Evaluation,
    )

    missing = [
        (clip_evals, eval_uuid)
        for clip_evals, eval_uuid in zip(clip_evaluations, evaluations_uuids)
        if clip_evals.uuid not in mapping
    ]
    if not missing:
        return mapping

    values = []
    for clip_eval, eval_uuid in missing:
        db_eval_id = evaluations.get(eval_uuid)
        if db_eval_id is None:
            continue

        db_clip_ann_id = clip_annotations.get(clip_eval.annotations)
        if db_clip_ann_id is None:
            continue

        db_clip_pred_id = clip_predictions.get(clip_eval.predictions)
        if db_clip_pred_id is None:
            continue

        values.append(
            {
                "uuid": clip_eval.uuid,
                "score": clip_eval.score,
                "evaluation_id": db_eval_id,
                "clip_annotation_id": db_clip_ann_id,
                "clip_prediction_id": db_clip_pred_id,
                "created_on": datetime.datetime.now(),
            }
        )

    if not values:
        return mapping

    stmt = insert(models.ClipEvaluation)
    await session.execute(stmt, values)

    created = await get_mapping(
        session,
        {v["uuid"] for v in values},
        models.ClipEvaluation,
    )
    mapping.update(created)

    return mapping


async def _create_clip_evaluation_metrics(
    session: AsyncSession,
    clip_evaluations: list[ClipEvaluationObject],
    mapping: dict[UUID, int],
) -> None:
    values = []
    for clip_eval in clip_evaluations:
        if not clip_eval.metrics:
            continue

        db_clip_eval_id = mapping.get(clip_eval.uuid)
        if db_clip_eval_id is None:
            continue

        for name, value in clip_eval.metrics.items():
            values.append(
                {
                    "clip_evaluation_id": db_clip_eval_id,
                    "name": name,
                    "value": value,
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
            "clip_evaluation_id": v["clip_evaluation_id"],
            "created_on": datetime.datetime.now(),
        }
        for v in values
    ]

    stmt = select(
        models.ClipEvaluationMetric.clip_evaluation_id,
        models.ClipEvaluationMetric.feature_name_id,
    ).where(
        tuple_(
            models.ClipEvaluationMetric.clip_evaluation_id,
            models.ClipEvaluationMetric.feature_name_id,
        ).in_((v["clip_evaluation_id"], v["feature_name_id"]) for v in values)
    )
    results = await session.execute(stmt)
    existing = {(r[0], r[1]) for r in results.scalars().all()}

    missing = [
        v
        for v in values
        if (v["clip_evaluation_id"], v["feature_name_id"]) not in existing
    ]

    if not missing:
        return

    stmt = insert(models.ClipEvaluationMetric)
    await session.execute(stmt, missing)
