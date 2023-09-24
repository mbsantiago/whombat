"""API functions for interacting with evaluation tasks."""

from cachetools import LRUCache
from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common
from whombat.filters.base import Filter

clips_cache = cache.CacheCollection(schemas.EvaluationTask)


__all__ = [
    "get_by_id",
    "get_many",
    "create",
    "create_many",
    "delete",
]


@clips_cache.cached(
    name="evaluation_task_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, evaluation_task_id: evaluation_task_id,
    data_key=lambda evaluation_task: evaluation_task.id,
)
async def get_by_id(
    session: AsyncSession,
    evaluation_task_id: int,
) -> schemas.EvaluationTask:
    """Get an evaluation task by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    evaluation_task_id : int
        The ID of the evaluation task.

    Returns
    -------
    schemas.EvaluationTask
        The evaluation task.

    Raises
    ------
    whombat.exceptions.NotFound
        If the evaluation task does not exist.
    """
    evaluation_task = await common.get_object(
        session,
        models.EvaluationTask,
        models.EvaluationTask.id == evaluation_task_id,
    )
    return schemas.EvaluationTask.model_validate(evaluation_task)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.EvaluationTask], int]:
    """Get multiple evaluation tasks.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    limit : int, optional
        The maximum number of evaluation tasks to return.
        Defaults to 1000.
    offset : int, optional
        The number of evaluation tasks to skip. Defaults to 0.
    filters : list[Filter], optional
        A list of filters to apply. Defaults to None.
    sort_by : str, optional
        The field to sort the evaluation tasks by. Defaults to "-created_at".

    Returns
    -------
    tuple[list[schemas.EvaluationTask], int]
        A tuple containing the list of evaluation tasks and the total number of
        evaluation tasks that match the query.
    """
    evaluation_tasks, total = await common.get_objects(
        session,
        models.EvaluationTask,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return (
        [schemas.EvaluationTask.model_validate(x) for x in evaluation_tasks],
        total,
    )


@clips_cache.with_update
async def create(
    session: AsyncSession,
    data: schemas.EvaluationTaskCreate,
) -> schemas.EvaluationTask:
    """Create an evaluation task.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    data : schemas.EvaluationTaskCreate
        The evaluation task to create.

    Returns
    -------
    schemas.EvaluationTask
        The created evaluation task.
    """
    evaluation_task = await common.create_object(
        session,
        models.EvaluationTask,
        data,
    )
    return schemas.EvaluationTask.model_validate(evaluation_task)


async def create_many(
    session: AsyncSession,
    data: list[schemas.EvaluationTaskCreate],
) -> list[schemas.EvaluationTask]:
    """Create multiple evaluation tasks.

    Use this function to create multiple evaluation tasks at
    once. This function will not create duplicate evaluation
    tasks. If an evaluation task already exists, it will be
    returned instead of creating a new one.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    data : list[schemas.EvaluationTaskCreate]
        The evaluation tasks to create.

    Returns
    -------
    list[schemas.EvaluationTask]
    """
    evaluation_set = await common.create_objects_without_duplicates(
        session,
        models.EvaluationTask,
        data,
        key=lambda x: (x.evaluation_set_id, x.task_id),
        key_column=tuple_(
            models.EvaluationTask.evaluation_set_id,
            models.EvaluationTask.task_id,
        ),
    )
    return [schemas.EvaluationTask.model_validate(x) for x in evaluation_set]


@clips_cache.with_update
async def delete(
    session: AsyncSession,
    evaluation_task_id: int,
) -> schemas.EvaluationTask:
    """Delete an evaluation task.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    evaluation_task_id : int
        The ID of the evaluation task.

    Returns
    -------
    schemas.EvaluationTask
        The deleted evaluation task.

    Raises
    ------
    whombat.exceptions.NotFound
        If the evaluation task does not exist.
    """
    evaluation_task = await common.delete_object(
        session,
        models.EvaluationTask,
        models.EvaluationTask.id == evaluation_task_id,
    )
    return schemas.EvaluationTask.model_validate(evaluation_task)
