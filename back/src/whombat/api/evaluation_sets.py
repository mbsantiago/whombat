"""API functions for interacting with evaluation sets."""
import uuid
from typing import Sequence

from cachetools import LRUCache
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common
from whombat.filters.base import Filter

__all__ = [
    "create",
    "delete",
    "get_many",
    "get_by_id",
    "get_by_name",
    "get_by_uuid",
    "update",
]


evaluation_sets_cache = cache.CacheCollection(schemas.EvaluationSet)


@evaluation_sets_cache.cached(
    name="evaluation_set_by_id",
    cache=LRUCache(maxsize=100),
    key=lambda _, evaluation_set_id: evaluation_set_id,
    data_key=lambda evaluation_set: evaluation_set.id,
)
async def get_by_id(
    session: AsyncSession,
    evaluation_set_id: int,
) -> schemas.EvaluationSet:
    """Get an evaluation set by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    evaluation_set_id : int
        The ID of the evaluation set.

    Returns
    -------
    schemas.EvaluationSet
        The evaluation set.

    Raises
    ------
    whombat.exceptions.NotFound
        If the evaluation set does not exist.
    """
    dataset = await common.get_object(
        session,
        models.EvaluationSet,
        models.EvaluationSet.id == evaluation_set_id,
    )
    return schemas.EvaluationSet.model_validate(dataset)


@evaluation_sets_cache.cached(
    name="evaluation_set_by_uuid",
    cache=LRUCache(maxsize=100),
    key=lambda _, evaluation_set_uuid: evaluation_set_uuid,
    data_key=lambda evaluation_set: evaluation_set.uuid,
)
async def get_by_uuid(
    session: AsyncSession,
    evaluation_set_uuid: uuid.UUID,
) -> schemas.EvaluationSet:
    """Get an evaluation set by its UUID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    evaluation_set_uuid : uuid.UUID
        The UUID of the evaluation set.

    Returns
    -------
    schemas.EvaluationSet
        The evaluation set.

    Raises
    ------
    whombat.exceptions.NotFound
        If the evaluation set does not exist.
    """
    dataset = await common.get_object(
        session,
        models.EvaluationSet,
        models.EvaluationSet.uuid == evaluation_set_uuid,
    )
    return schemas.EvaluationSet.model_validate(dataset)


@evaluation_sets_cache.cached(
    name="evaluation_set_by_name",
    cache=LRUCache(maxsize=100),
    key=lambda _, evaluation_set_name: evaluation_set_name,
    data_key=lambda evaluation_set: evaluation_set.name,
)
async def get_by_name(
    session: AsyncSession,
    evaluation_set_name: str,
) -> schemas.EvaluationSet:
    """Get an evaluation set by its name.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    evaluation_set_name : str
        The name of the evaluation set.

    Returns
    -------
    schemas.EvaluationSet
        The evaluation set.

    Raises
    ------
    whombat.exceptions.NotFound
        If the evaluation set does not exist.
    """
    dataset = await common.get_object(
        session,
        models.EvaluationSet,
        models.EvaluationSet.name == evaluation_set_name,
    )
    return schemas.EvaluationSet.model_validate(dataset)


@evaluation_sets_cache.with_update
async def create(
    session: AsyncSession,
    data: schemas.EvaluationSetCreate,
) -> schemas.EvaluationSet:
    """Create an annotation project."""
    annotation_project = await common.create_object(
        session,
        models.EvaluationSet,
        data,
    )
    return schemas.EvaluationSet.model_validate(annotation_project)


@evaluation_sets_cache.with_update
async def update(
    session: AsyncSession,
    evaluation_set_id: int,
    data: schemas.EvaluationSetUpdate,
) -> schemas.EvaluationSet:
    """Update an evaluation set."""
    evaluation_set = await common.update_object(
        session,
        models.EvaluationSet,
        models.EvaluationSet.id == evaluation_set_id,
        data,
    )
    return schemas.EvaluationSet.model_validate(evaluation_set)


@evaluation_sets_cache.with_clear
async def delete(
    session: AsyncSession,
    evaluation_set_id: int,
) -> schemas.EvaluationSet:
    """Delete an evaluation set."""
    evaluation_set = await common.delete_object(
        session,
        models.EvaluationSet,
        models.EvaluationSet.id == evaluation_set_id,
    )
    return schemas.EvaluationSet.model_validate(evaluation_set)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.EvaluationSet], int]:
    """Get multiple evaluation sets.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    limit : int, optional
        The maximum number of evaluation sets to return, by default 100.
    offset : int, optional
        The number of evaluation sets to skip, by default 0.
    filters : Sequence[Filter], optional
        A list of filters to apply, by default None.
    sort_by : str, optional
        The field to sort by, by default "-created_at".

    Returns
    -------
    tuple[list[schemas.EvaluationSet], int]
        A tuple containing the list of evaluation sets and the total number of
        evaluation sets.
    """
    annotation_projects, count = await common.get_objects(
        session,
        models.EvaluationSet,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.EvaluationSet.model_validate(ap) for ap in annotation_projects
    ], count


@evaluation_sets_cache.with_update
async def add_tag(
    session: AsyncSession,
    evaluation_set_id: int,
    tag_id: int,
) -> schemas.EvaluationSet:
    """Add a tag to an annotation project."""
    evaluation_set = await common.add_tag_to_object(
        session,
        models.EvaluationSet,
        models.EvaluationSet.id == evaluation_set_id,
        tag_id,
    )
    return schemas.EvaluationSet.model_validate(evaluation_set)


@evaluation_sets_cache.with_update
async def remove_tag(
    session: AsyncSession,
    evaluation_set_id: int,
    tag_id: int,
) -> schemas.EvaluationSet:
    """Remove a tag from an annotation project."""
    evaluation_set = await common.remove_tag_from_object(
        session,
        models.EvaluationSet,
        models.EvaluationSet.id == evaluation_set_id,
        tag_id,
    )
    return schemas.EvaluationSet.model_validate(evaluation_set)
