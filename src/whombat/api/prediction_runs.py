"""Python API for interacting with Prediction Runs."""

from typing import Sequence

from cachetools import LRUCache
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common
from whombat.filters.base import Filter

__all__ = [
    "get_by_id",
    "get_many",
    "create",
    "update",
    "evaluate",
    "delete",
]

prediction_run_cache = cache.CacheCollection(schemas.PredictionRun)


@prediction_run_cache.cached(
    name="prediction_run_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, prediction_run_id: prediction_run_id,
    data_key=lambda prediction_run: prediction_run.id,
)
async def get_by_id(
    session: AsyncSession, prediction_run_id: int
) -> schemas.PredictionRun:
    """Get a model run by ID."""
    prediction_run = await common.get_object(
        session,
        models.PredictionRun,
        models.PredictionRun.id == prediction_run_id,
    )
    return schemas.PredictionRun.model_validate(prediction_run)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.PredictionRun], int]:
    """Get a list of model runs."""
    prediction_runs, count = await common.get_objects(
        session,
        models.PredictionRun,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.PredictionRun.model_validate(prediction_run)
        for prediction_run in prediction_runs
    ], count


@prediction_run_cache.with_update
async def create(
    session: AsyncSession, data: schemas.PredictionRunCreate
) -> schemas.PredictionRun:
    """Create a new model run."""
    prediction_run = await common.create_object(
        session,
        models.PredictionRun,
        data,
    )
    return schemas.PredictionRun.model_validate(prediction_run)


@prediction_run_cache.with_update
async def update(
    session: AsyncSession,
    prediction_run_id: int,
    data: schemas.PredictionRunUpdate,
) -> schemas.PredictionRun:
    """Update a model run."""
    prediction_run = await common.update_object(
        session,
        models.PredictionRun,
        models.PredictionRun.id == prediction_run_id,
        data,
    )
    return schemas.PredictionRun.model_validate(prediction_run)


@prediction_run_cache.with_update
async def evaluate(
    session: AsyncSession,
    prediction_run_id: int,
) -> schemas.PredictionRun:
    """Evaluate a model run."""
    prediction_run = await common.get_object(
        session,
        models.PredictionRun,
        models.PredictionRun.id == prediction_run_id,
    )
    # TODO: Evaluate model run
    return schemas.PredictionRun.model_validate(prediction_run)


@prediction_run_cache.with_update
async def delete(
    session: AsyncSession,
    prediction_run_id: int,
) -> schemas.PredictionRun:
    """Delete a model run."""
    prediction_run = await common.delete_object(
        session,
        models.PredictionRun,
        models.PredictionRun.id == prediction_run_id,
    )
    return schemas.PredictionRun.model_validate(prediction_run)


# TODO: Implement load and dump
