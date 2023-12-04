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

model_run_cache = cache.CacheCollection(schemas.ModelRun)


@model_run_cache.cached(
    name="model_run_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, model_run_id: model_run_id,
    data_key=lambda model_run: model_run.id,
)
async def get_by_id(
    session: AsyncSession, model_run_id: int
) -> schemas.ModelRun:
    """Get a model run by ID."""
    model_run = await common.get_object(
        session,
        models.ModelRun,
        models.ModelRun.id == model_run_id,
    )
    return schemas.ModelRun.model_validate(model_run)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.ModelRun], int]:
    """Get a list of model runs."""
    model_runs, count = await common.get_objects(
        session,
        models.ModelRun,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.ModelRun.model_validate(model_run) for model_run in model_runs
    ], count


@model_run_cache.with_update
async def create(
    session: AsyncSession, data: schemas.ModelRunCreate
) -> schemas.ModelRun:
    """Create a new model run."""
    model_run = await common.create_object(
        session,
        models.ModelRun,
        data,
    )
    return schemas.ModelRun.model_validate(model_run)


@model_run_cache.with_update
async def update(
    session: AsyncSession,
    model_run_id: int,
    data: schemas.ModelRunUpdate,
) -> schemas.ModelRun:
    """Update a model run."""
    model_run = await common.update_object(
        session,
        models.ModelRun,
        models.ModelRun.id == model_run_id,
        data,
    )
    return schemas.ModelRun.model_validate(model_run)


@model_run_cache.with_update
async def evaluate(
    session: AsyncSession,
    model_run_id: int,
) -> schemas.ModelRun:
    """Evaluate a model run."""
    model_run = await common.get_object(
        session,
        models.ModelRun,
        models.ModelRun.id == model_run_id,
    )
    # TODO: Evaluate model run
    return schemas.ModelRun.model_validate(model_run)


@model_run_cache.with_update
async def delete(
    session: AsyncSession,
    model_run_id: int,
) -> schemas.ModelRun:
    """Delete a model run."""
    model_run = await common.delete_object(
        session,
        models.ModelRun,
        models.ModelRun.id == model_run_id,
    )
    return schemas.ModelRun.model_validate(model_run)


# TODO: Implement load and dump
