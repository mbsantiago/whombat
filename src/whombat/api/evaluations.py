"""API functions to interact with evaluations."""

from typing import Sequence
from uuid import UUID

from soundevent import data
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import features
from whombat.api.clip_evaluations import clip_evaluations
from whombat.api.common import (
    BaseAPI,
    create_object,
    delete_object,
    update_object,
)
from whombat.filters.base import Filter
from whombat.filters.clip_evaluations import EvaluationFilter


class EvaluationAPI(
    BaseAPI[
        UUID,
        models.Evaluation,
        schemas.Evaluation,
        schemas.EvaluationCreate,
        schemas.EvaluationUpdate,
    ]
):
    """API functions to interact with evaluations."""

    async def add_metric(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
        metric: schemas.Feature,
    ) -> schemas.Evaluation:
        """Add a metric to an evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                raise ValueError(
                    f"Evaluation {obj.id} already has a metric "
                    f"with feature name {metric.feature_name}."
                )

        await create_object(
            session,
            models.EvaluationMetric,
            schemas.EvaluationMetricCreate(
                evaluation_id=obj.id,
                feature_name_id=metric.feature_name.id,
                value=metric.value,
            ),
        )
        obj.metrics.append(metric)
        self._update_cache(obj)
        return obj

    async def update_metric(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
        metric: schemas.Feature,
    ) -> schemas.Evaluation:
        """Update a metric of an evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                break
        else:
            raise ValueError(
                f"Clip evaluation {obj.id} does not have a metric "
                f"with feature name {metric.feature_name}."
            )

        await update_object(
            session,
            models.ClipEvaluationMetric,
            and_(
                models.ClipEvaluationMetric.clip_evaluation_id == obj.id,
                models.ClipEvaluationMetric.feature_name_id
                == metric.feature_name.id,
            ),
            value=metric.value,
        )
        obj = obj.model_copy(
            update=dict(
                metrics=[
                    m if m.feature_name != metric.feature_name else metric
                    for m in obj.metrics
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_metric(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
        metric: schemas.Feature,
    ) -> schemas.Evaluation:
        """Remove a metric from an evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                break
        else:
            raise ValueError(
                f"Evaluation {obj.id} does not have a metric "
                f"with feature name {metric.feature_name}."
            )

        await delete_object(
            session,
            models.EvaluationMetric,
            and_(
                models.EvaluationMetric.evaluation_id == obj.id,
                models.EvaluationMetric.feature_name_id
                == metric.feature_name.id,
            ),
        )
        obj = obj.model_copy(
            update=dict(
                metrics=[
                    m
                    for m in obj.metrics
                    if m.feature_name != metric.feature_name
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def get_clip_evaluations(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
        *,
        limit: int = 100,
        offset: int = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = None,
    ) -> tuple[Sequence[schemas.ClipEvaluation], int]:
        """Get clip evaluations of an evaluation."""
        return await clip_evaluations.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[
                EvaluationFilter(
                    eq=obj.id,
                ),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.Evaluation,
    ) -> schemas.Evaluation:
        """Create an evaluation from a sound event evaluation."""
        return await self.create(
            session,
            schemas.EvaluationCreate(
                created_on=data.created_on,
                uuid=data.uuid,
                score=data.score or 0,
                task=data.evaluation_task,
            ),
        )

    async def _update_from_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
        data: data.Evaluation,
    ) -> schemas.Evaluation:
        """Update an evaluation from a sound event evaluation."""
        _existing_metrics = {m.feature_name.name: m for m in obj.metrics}
        for metric in data.metrics:
            if metric.name in _existing_metrics:
                continue

            feature = await features.from_soundevent(session, metric)
            obj = await self.add_metric(session, obj, feature)

        for clip_evaluation in data.clip_evaluations:
            await clip_evaluations.from_soundevent(
                session,
                clip_evaluation,
                obj,
            )

        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.Evaluation,
    ) -> schemas.Evaluation:
        """Create an evaluation from a sound event evaluation."""
        try:
            obj = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            obj = await self._create_from_soundevent(session, data)

        obj = await self._update_from_soundevent(session, obj, data)
        return obj

    async def to_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
    ) -> data.Evaluation:
        """Create a sound event evaluation from an evaluation."""
        evals, _ = await self.get_clip_evaluations(
            session,
            obj,
        )

        metrics = [features.to_soundevent(m) for m in obj.metrics]

        return data.Evaluation(
            created_on=obj.created_on,
            uuid=obj.uuid,
            score=obj.score,
            evaluation_task=obj.task,
            metrics=metrics,
            clip_evaluations=[
                await clip_evaluations.to_soundevent(session, ce)
                for ce in evals
            ],
        )


evaluations = EvaluationAPI()
