"""API functions to interact with clip evaluations."""
from uuid import UUID

from soundevent import data
from sqlalchemy import and_, tuple_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import ColumnElement

from whombat import models, schemas
from whombat.api import (
    features,
    sound_event_annotations,
    sound_event_predictions,
)
from whombat.api.common import (
    BaseAPI,
    create_object,
    delete_object,
    update_object,
)


class ClipEvaluationAPI(
    BaseAPI[
        UUID,
        models.ClipEvaluation,
        schemas.ClipEvaluation,
        schemas.ClipEvaluationCreate,
        schemas.ClipEvaluationUpdate,
    ]
):
    """API for sound event evaluations."""

    async def add_metric(
        self,
        session: AsyncSession,
        obj: schemas.ClipEvaluation,
        metric: schemas.Feature,
    ) -> schemas.ClipEvaluation:
        """Add a metric to a sound event evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                raise ValueError(
                    f"Sound event evaluation {obj.id} already has a metric "
                    f"with feature name {metric.feature_name}."
                )

        await create_object(
            session,
            models.ClipEvaluationMetric,
            schemas.ClipEvaluationMetricCreate(
                clip_evaluation_id=obj.id,
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
        obj: schemas.ClipEvaluation,
        metric: schemas.Feature,
    ) -> schemas.ClipEvaluation:
        """Update a metric of a sound event evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                break
        else:
            raise ValueError(
                f"Sound event evaluation {obj.id} does not have a metric "
                f"with feature name {metric.feature_name}."
            )

        await update_object(
            session,
            models.ClipEvaluationMetric,
            and_(
                models.ClipEvaluationMetric.clip_evaluation_id
                == obj.id,
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
        obj: schemas.ClipEvaluation,
        metric: schemas.Feature,
    ) -> schemas.ClipEvaluation:
        """Remove a metric from a sound event evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                break
        else:
            raise ValueError(
                f"Sound event evaluation {obj.id} does not have a metric "
                f"with feature name {metric.feature_name}."
            )

        await delete_object(
            session,
            models.ClipEvaluationMetric,
            and_(
                models.ClipEvaluationMetric.clip_evaluation_id
                == obj.id,
                models.ClipEvaluationMetric.feature_name_id
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

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.Match,
    ) -> schemas.ClipEvaluation:
        """Create a sound event evaluation from a sound event evaluation."""


        obj = await self.create(
            session,
            schemas.ClipEvaluationCreate(
                clip_evaluation_id=clip_evaluation.id,
                source_id=sound_event_prediction.id
                if sound_event_prediction
                else None,
                target_id=sound_event_annotation.id
                if sound_event_annotation
                else None,
                affinity=data.affinity,
                score=data.score or 0,
            ),
        )

        for feature in data.metrics:
            feat = await features.from_soundevent(
                session,
                feature,
            )
            obj = await self.add_metric(session, obj, feat)

        return obj

    @classmethod
    def _key_fn(
        cls, obj: schemas.ClipEvaluation | models.ClipEvaluation
    ) -> tuple[int, int | None, int | None]:
        return (
            obj.clip_evaluation_id,
            obj.source_id,
            obj.target_id,
        )

    @classmethod
    def _get_key_column(cls) -> ColumnElement:
        return tuple_(
            models.ClipEvaluation.clip_evaluation_id,
            models.ClipEvaluation.source_id,
            models.ClipEvaluation.target_id,
        )


clip_evaluations = ClipEvaluationAPI()
