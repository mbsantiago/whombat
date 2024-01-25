"""API functions to interact with evaluations."""

from pathlib import Path
from typing import Sequence
from uuid import UUID

from soundevent import data
from soundevent import evaluation as evaluate
from soundevent.io.aoef import EvaluationObject, to_aeof
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api.clip_evaluations import clip_evaluations
from whombat.api.common import (
    BaseAPI,
    create_object,
    delete_object,
    update_object,
)
from whombat.api.evaluation_sets import evaluation_sets
from whombat.api.features import features
from whombat.api.io.aoef.evaluations import import_evaluation
from whombat.api.model_runs import model_runs
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

    _model = models.Evaluation
    _schema = schemas.Evaluation

    async def create(
        self,
        session: AsyncSession,
        task: str,
        score: float = 0,
        **kwargs,
    ) -> schemas.Evaluation:
        """Create an evaluation.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        task
            The evaluated task.

        Returns
        -------
        schemas.Evaluation
            Created evaluation.

        Notes
        -----
        The `task` parameter is a string that plays a crucial role in defining
        the machine learning context for the function evaluation. It represents
        the specific name of the machine learning task being assessed. This
        task name serves as a key identifier, indicating both the nature of the
        expected predictions and the criteria for evaluating their performance.
        Specifying the `task` is essential for providing clear and meaningful
        evaluations. Different machine learning tasks have distinct objectives,
        metrics, and criteria for success. Therefore, by explicitly defining
        the `task`, the function ensures that predictions are evaluated in a
        manner aligned with the specific requirements and expectations of that
        task. For example, the `task` parameter might be set to
        "clip classification," "sound event detection," or any other task
        type relevant to the machine learning model or user predictions.
        """
        return await self.create_from_data(
            session,
            schemas.EvaluationCreate(
                task=task,
                score=score,
            ),
            **kwargs,
        )

    async def add_metric(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
        metric: schemas.Feature,
    ) -> schemas.Evaluation:
        """Add a metric to an evaluation."""
        for m in obj.metrics:
            if m.name == metric.name:
                raise ValueError(
                    f"Evaluation {obj.id} already has a metric "
                    f"with feature name {metric.name}."
                )

        feature_name = await features.get_or_create(
            session,
            metric.name,
        )

        await create_object(
            session,
            models.EvaluationMetric,
            evaluation_id=obj.id,
            feature_name_id=feature_name.id,
            value=metric.value,
        )

        obj = obj.model_copy(
            update=dict(
                metrics=[
                    *obj.metrics,
                    metric,
                ]
            )
        )
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
            if m.name == metric.name:
                break
        else:
            raise ValueError(
                f"Clip evaluation {obj.id} does not have a metric "
                f"with feature name {metric.name}."
            )

        feature_name = await features.get(session, metric.name)

        await update_object(
            session,
            models.ClipEvaluationMetric,
            and_(
                models.ClipEvaluationMetric.clip_evaluation_id == obj.id,
                models.ClipEvaluationMetric.feature_name_id == feature_name.id,
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
        obj: schemas.Evaluation,
        metric: schemas.Feature,
    ) -> schemas.Evaluation:
        """Remove a metric from an evaluation."""
        for m in obj.metrics:
            if m.name == metric.name:
                break
        else:
            raise ValueError(
                f"Evaluation {obj.id} does not have a metric "
                f"with feature name {metric.name}."
            )

        feature_name = await features.get(session, metric.name)

        await delete_object(
            session,
            models.EvaluationMetric,
            and_(
                models.EvaluationMetric.evaluation_id == obj.id,
                models.EvaluationMetric.feature_name_id == feature_name.id,
            ),
        )
        obj = obj.model_copy(
            update=dict(
                metrics=[m for m in obj.metrics if m.name != metric.name]
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
                    eq=obj.uuid,
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
            score=data.score or 0,
            task=data.evaluation_task,
            created_on=data.created_on,
            uuid=data.uuid,
        )

    async def _update_from_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.Evaluation,
        data: data.Evaluation,
    ) -> schemas.Evaluation:
        """Update an evaluation from a sound event evaluation."""
        _existing_metrics = {m.name: m for m in obj.metrics}
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
        audio_dir: Path | None = None,
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
                await clip_evaluations.to_soundevent(
                    session,
                    ce,
                    audio_dir=audio_dir,
                )
                for ce in evals
            ],
        )

    async def evaluate_model_run(
        self,
        session: AsyncSession,
        model_run: schemas.ModelRun,
        evaluation_set: schemas.EvaluationSet,
        audio_dir: Path,
    ) -> schemas.Evaluation:
        model_run_se = await model_runs.to_soundevent(
            session,
            model_run,
        )
        evaluation_set_se = await evaluation_sets.to_soundevent(
            session,
            evaluation_set,
        )
        evaluation = evaluate_predictions(
            model_run_se.clip_predictions,
            evaluation_set_se.clip_annotations,
            evaluation_set_se.evaluation_tags,
            evaluation_set.task,
        )
        obj: EvaluationObject = to_aeof(evaluation)  # type: ignore
        db_eval = await import_evaluation(
            session,
            obj.model_dump(),
            audio_dir=audio_dir,
            base_audio_dir=audio_dir,
        )

        # Create model run evaluation
        model_run_eval = models.ModelRunEvaluation(
            model_run_id=model_run.id,
            evaluation_id=db_eval.id,
            evaluation_set_id=evaluation_set.id,
        )
        session.add(model_run_eval)
        await session.flush()

        await session.refresh(db_eval)
        return schemas.Evaluation.model_validate(db_eval)


EVALUATION_METHODS = {
    "sound_event_detection": evaluate.sound_event_detection,
    "clip_classification": evaluate.clip_classification,
    "clip_multilabel_classification": evaluate.clip_multilabel_classification,
    "sound_event_classification": evaluate.sound_event_classification,
}


def evaluate_predictions(
    clip_predictions: Sequence[data.ClipPrediction],
    clip_annotations: Sequence[data.ClipAnnotation],
    tags: Sequence[data.Tag],
    task: str,
) -> data.Evaluation:
    """Evaluate predictions."""
    eval_fn = EVALUATION_METHODS.get(task)

    if eval_fn is None:
        raise ValueError(f"Task {task} not supported.")

    return eval_fn(
        clip_predictions,
        clip_annotations,
        tags,
    )


evaluations = EvaluationAPI()
