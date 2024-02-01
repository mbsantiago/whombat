"""API functions to interact with sound event evaluations."""

from pathlib import Path
from uuid import UUID

from soundevent import data
from sqlalchemy import and_, tuple_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import ColumnElement

from whombat import models, schemas
from whombat.api.common import (
    BaseAPI,
    create_object,
    delete_object,
    update_object,
)
from whombat.api.features import features
from whombat.api.sound_event_annotations import sound_event_annotations
from whombat.api.sound_event_predictions import sound_event_predictions


class SoundEventEvaluationAPI(
    BaseAPI[
        UUID,
        models.SoundEventEvaluation,
        schemas.SoundEventEvaluation,
        schemas.SoundEventEvaluationCreate,
        schemas.SoundEventEvaluationUpdate,
    ]
):
    """API for sound event evaluations."""

    _model = models.SoundEventEvaluation
    _schema = schemas.SoundEventEvaluation

    async def create(
        self,
        session: AsyncSession,
        clip_evaluation: schemas.ClipEvaluation,
        affinity: float = 0,
        score: float = 0,
        source: schemas.SoundEventPrediction | None = None,
        target: schemas.SoundEventAnnotation | None = None,
        **kwargs,
    ) -> schemas.SoundEventEvaluation:
        """Create a sound event evaluation.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        clip_evaluation
            The clip evaluation that this sound event evaluation belongs to.
        affinity
            The geometric affinity between the source and target sound events
            regions of interest. Defaults to 0.
        score
            An overall score for the sound event evaluation. Defaults to 0.
        source
            The prediction being evaluated. Can be None if the target
            is not None, in which case no prediction was matched to the target,
            that is, this is a false negative.
        target
            The annotation being evaluated. Can be None if the source
            is not None, in which case no annotation was matched to the source,
            that is, this is a false positive.
        **kwargs
            Additional keyword arguments to use when creating the sound event
            evaluation, (e.g. `uuid` or `created_on`.)

        Returns
        -------
        schemas.SoundEventEvaluation
            Created sound event evaluation.
        """
        return await self.create_from_data(
            session,
            schemas.SoundEventEvaluationCreate(
                affinity=affinity,
                score=score,
            ),
            clip_evaluation_id=clip_evaluation.id,
            source_id=source.id if source else None,
            target_id=target.id if target else None,
            **kwargs,
        )

    async def add_metric(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventEvaluation,
        metric: schemas.Feature,
    ) -> schemas.SoundEventEvaluation:
        """Add a metric to a sound event evaluation."""
        for m in obj.metrics:
            if m.name == metric.name:
                raise ValueError(
                    f"Sound event evaluation {obj.id} already has a metric "
                    f"with feature name {metric.name}."
                )

        feature_name = await features.get_or_create(session, name=metric.name)

        await create_object(
            session,
            models.SoundEventEvaluationMetric,
            sound_event_evaluation_id=obj.id,
            feature_name_id=feature_name.id,
            value=metric.value,
        )
        obj.metrics.append(metric)
        self._update_cache(obj)
        return obj

    async def update_metric(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventEvaluation,
        metric: schemas.Feature,
    ) -> schemas.SoundEventEvaluation:
        """Update a metric of a sound event evaluation."""
        for m in obj.metrics:
            if m.name == metric.name:
                break
        else:
            raise ValueError(
                f"Sound event evaluation {obj.id} does not have a metric "
                f"with feature name {metric.name}."
            )

        feature_name = await features.get(session, metric.name)

        await update_object(
            session,
            models.SoundEventEvaluationMetric,
            and_(
                models.SoundEventEvaluationMetric.sound_event_evaluation_id
                == obj.id,
                models.SoundEventEvaluationMetric.feature_name_id
                == feature_name.id,
            ),
            value=metric.value,
        )
        obj = obj.model_copy(
            update=dict(
                metrics=[
                    m if m.name != metric.name else metric for m in obj.metrics
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_metric(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventEvaluation,
        metric: schemas.Feature,
    ) -> schemas.SoundEventEvaluation:
        """Remove a metric from a sound event evaluation."""
        for m in obj.metrics:
            if m.name == metric.name:
                break
        else:
            raise ValueError(
                f"Sound event evaluation {obj.id} does not have a metric "
                f"with feature name {metric.name}."
            )

        feature_name = await features.get(session, metric.name)

        await delete_object(
            session,
            models.SoundEventEvaluationMetric,
            and_(
                models.SoundEventEvaluationMetric.sound_event_evaluation_id
                == obj.id,
                models.SoundEventEvaluationMetric.feature_name_id
                == feature_name.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                metrics=[m for m in obj.metrics if m.name != metric.name]
            )
        )
        self._update_cache(obj)
        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.Match,
        clip_evaluation: schemas.ClipEvaluation,
    ) -> schemas.SoundEventEvaluation:
        """Create a sound event evaluation from a sound event evaluation."""
        sound_event_annotation = None
        if data.target:
            sound_event_annotation = (
                await sound_event_annotations.from_soundevent(
                    session,
                    data.target,
                    clip_evaluation.clip_annotation,
                )
            )

        sound_event_prediction = None
        if data.source:
            sound_event_prediction = (
                await sound_event_predictions.from_soundevent(
                    session,
                    data.source,
                    clip_evaluation.clip_prediction,
                )
            )

        obj = await self.create(
            session,
            clip_evaluation=clip_evaluation,
            source=sound_event_prediction,
            target=sound_event_annotation,
            affinity=data.affinity,
            score=data.score or 0,
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
        obj: schemas.SoundEventEvaluation,
        audio_dir: Path | None = None,
        recording: schemas.Recording | None = None,
    ) -> data.Match:
        """Convert a sound event evaluation to soundevent format."""
        source = None
        if obj.source:
            source = await sound_event_predictions.to_soundevent(
                session,
                obj.source,
                audio_dir=audio_dir,
                recording=recording,
            )

        target = None
        if obj.target:
            target = await sound_event_annotations.to_soundevent(
                session,
                obj.target,
                audio_dir=audio_dir,
                recording=recording,
            )

        return data.Match(
            uuid=obj.uuid,
            affinity=obj.affinity,
            score=obj.score,
            source=source,
            target=target,
            metrics=[features.to_soundevent(m) for m in obj.metrics],
        )

    def _key_fn(self, obj: dict):
        return (
            obj.get("clip_evaluation_id"),
            obj.get("source_id"),
            obj.get("target_id"),
        )

    def _get_key_column(self) -> ColumnElement:
        return tuple_(
            models.SoundEventEvaluation.clip_evaluation_id,
            models.SoundEventEvaluation.source_id,
            models.SoundEventEvaluation.target_id,
        )


sound_event_evaluations = SoundEventEvaluationAPI()
