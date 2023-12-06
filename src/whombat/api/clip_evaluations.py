"""API functions to interact with clip evaluations."""
from uuid import UUID

from typing import Sequence
from soundevent import data
from sqlalchemy import and_, tuple_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import ColumnElement

from whombat import models, schemas
from whombat.api import clip_annotations, clip_predictions, features
from whombat.api.sound_event_evaluations import sound_event_evaluations
from whombat.filters.base import Filter
from whombat.filters.sound_event_evaluations import ClipEvaluationFilter
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
    """API for clip evaluations."""

    async def add_metric(
        self,
        session: AsyncSession,
        obj: schemas.ClipEvaluation,
        metric: schemas.Feature,
    ) -> schemas.ClipEvaluation:
        """Add a metric to a clip evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                raise ValueError(
                    f"Clip evaluation {obj.id} already has a metric "
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
        """Update a metric of a clip evaluation."""
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
        obj: schemas.ClipEvaluation,
        metric: schemas.Feature,
    ) -> schemas.ClipEvaluation:
        """Remove a metric from a clip evaluation."""
        for m in obj.metrics:
            if m.feature_name == metric.feature_name:
                break
        else:
            raise ValueError(
                f"Clip evaluation {obj.id} does not have a metric "
                f"with feature name {metric.feature_name}."
            )

        await delete_object(
            session,
            models.ClipEvaluationMetric,
            and_(
                models.ClipEvaluationMetric.clip_evaluation_id == obj.id,
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
        data: data.ClipEvaluation,
        evaluation: schemas.Evaluation,
    ) -> schemas.ClipEvaluation:
        """Create a clip evaluation from an object in soundevent format.

        Parameters
        ----------
        session
            An open database session.
        data
            The clip evaluation in soundevent format.
        evaluation
            The evaluation to which the clip evaluation belongs.

        Returns
        -------
        schemas.ClipEvaluation
            The clip evaluation in whombat format.
        """
        clip_annotation = await clip_annotations.from_soundevent(
            session,
            data.annotations,
        )

        clip_prediction = await clip_predictions.from_soundevent(
            session,
            data.predictions,
        )

        obj = await self.create(
            session,
            schemas.ClipEvaluationCreate(
                uuid=data.uuid,
                clip_annotation_id=clip_annotation.id,
                clip_prediction_id=clip_prediction.id,
                evaluation_id=evaluation.id,
                score=data.score or 1,
            ),
        )

        for feature in data.metrics:
            feat = await features.from_soundevent(
                session,
                feature,
            )
            obj = await self.add_metric(session, obj, feat)

        return obj

    async def to_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.ClipEvaluation,
    ) -> data.ClipEvaluation:
        """Create a clip evaluation in soundevent format from a clip evaluation in whombat format.

        Parameters
        ----------
        session
            An open database session.
        obj
            The clip evaluation in whombat format.

        Returns
        -------
        data.ClipEvaluation
            The clip evaluation in soundevent format.
        """
        se_evaluations, _ = await self.get_sound_event_evaluations(
            session,
            obj,
            limit=-1,
        )

        annotations = clip_annotations.to_soundevent(
            obj.clip_annotation,
        )

        predictions = clip_predictions.to_soundevent(
            obj.clip_prediction,
        )

        return data.ClipEvaluation(
            uuid=obj.uuid,
            annotations=annotations,
            predictions=predictions,
            metrics=[
                features.to_soundevent(feat)
                for feat in obj.metrics
            ],
            matches=[
                sound_event_evaluations.to_soundevent(se_eval)
                for se_eval in se_evaluations
            ],
            score=obj.score,
        )

    async def get_sound_event_evaluations(
        self,
        session: AsyncSession,
        obj: schemas.ClipEvaluation,
        *,
        limit: int = 100,
        offset: int = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = None,
    ) -> tuple[Sequence[schemas.SoundEventEvaluation], int]:
        """Get the sound event evaluations of a clip evaluation."""
        return await sound_event_evaluations.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[
                ClipEvaluationFilter(eq=obj.id),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    @classmethod
    def _key_fn(
        cls, obj: schemas.ClipEvaluation | models.ClipEvaluation
    ) -> tuple[int, int, int]:
        return (
            obj.evaluation_id,
            obj.clip_annotation_id,
            obj.clip_prediction_id,
        )

    @classmethod
    def _get_key_column(cls) -> ColumnElement:
        return tuple_(
            models.ClipEvaluation.evaluation_id,
            models.ClipEvaluation.clip_annotation_id,
            models.ClipEvaluation.clip_prediction_id,
        )


clip_evaluations = ClipEvaluationAPI()
