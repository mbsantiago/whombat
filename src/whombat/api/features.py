"""API functions to interact with feature names."""

from typing import Any, Sequence

from cachetools import LRUCache
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common
from whombat.filters.base import Filter

__all__ = [
    "create",
    "create_many",
    "delete",
    "get_by_id",
    "get_by_name",
    "get_recordings",
    "update",
    "find",
]


feature_caches = cache.CacheCollection(schemas.FeatureName)


@feature_caches.cached(
    name="feature_name_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, feature_name_id: feature_name_id,
    data_key=lambda feature_name: feature_name.id,
)
async def get_by_id(
    session: AsyncSession,
    feature_name_id: int,
) -> schemas.FeatureName:
    """Get a feature name by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    feature_name_id : int
        The ID of the feature name.

    Returns
    -------
    schemas.FeatureName
        The feature name.

    Raises
    ------
    exceptions.NotFoundError
        If the feature name was not found.

    """
    db_feature_name = await common.get_object(
        session=session,
        model=models.FeatureName,
        condition=models.FeatureName.id == feature_name_id,
    )
    return schemas.FeatureName.model_validate(db_feature_name)


@feature_caches.cached(
    name="feature_name_by_name",
    cache=LRUCache(maxsize=1000),
    key=lambda _, feature_name: feature_name,
    data_key=lambda feature_name: feature_name.name,
)
async def get_by_name(
    session: AsyncSession,
    feature_name: str,
) -> schemas.FeatureName:
    """Get a feature name by its name.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    feature_name : str
        The name of the feature name.

    Returns
    -------
    schemas.FeatureName
        The feature name.

    Raises
    ------
    exceptions.NotFoundError
        If the feature name was not found.

    """
    db_feature_name = await common.get_object(
        session=session,
        model=models.FeatureName,
        condition=models.FeatureName.name == feature_name,
    )
    return schemas.FeatureName.model_validate(db_feature_name)


async def get_recordings(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
) -> tuple[list[schemas.FeatureName], int]:
    """Get all feature names.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    search : str, optional
        A search string to filter the results.
    limit : int, optional
        The maximum number of features to return. Defaults to 1000.
        Set to -1 to return all features.
    offset : int, optional
        The number of features to skip.

    Returns
    -------
    names : list[str]
        The names of all features.

    """
    db_feature_names, count = await common.get_objects(
        session=session,
        model=models.FeatureName,
        limit=limit,
        offset=offset,
        filters=filters,
    )
    return [
        schemas.FeatureName.model_validate(r) for r in db_feature_names
    ], count


@feature_caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.FeatureNameCreate,
) -> schemas.FeatureName:
    """Create a feature.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    name : str
        The name of the feature.

    Returns
    -------
    name : str
        The name of the feature.

    Raises
    ------
    whombat.exceptions.DuplicateObjectError
        If the feature already exists.

    """
    feature = await common.create_object(
        session=session,
        model=models.FeatureName,
        data=data,
    )
    return schemas.FeatureName.model_validate(feature)


async def create_many(
    session: AsyncSession,
    data: list[schemas.FeatureNameCreate],
) -> list[schemas.FeatureName]:
    """Get or create feature names.

    More efficient than calling `create_feature_name` multiple times.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data : list[schemas.FeatureNameCreate]
        The feature names to create.

    Returns
    -------
    feature_names : list[models.FeatureName]
        The feature names.

    """
    feature_names = await common.create_objects_without_duplicates(
        session=session,
        model=models.FeatureName,
        data=data,
        key=lambda x: x.name,
        key_column=models.FeatureName.name,
    )
    return [schemas.FeatureName.model_validate(r) for r in feature_names]


@cache.cached(
    name="feature_name_by_name",
    key=lambda _, data: data.name,
)
async def get_or_create(
    session: AsyncSession,
    data: schemas.FeatureNameCreate,
) -> schemas.FeatureName:
    """Get or create a feature name.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data : schemas.FeatureNameCreate
        The feature name to get or create.

    Returns
    -------
    name : str
        The name of the feature.

    """
    feature_name = await common.get_or_create_object(
        session=session,
        model=models.FeatureName,
        condition=models.FeatureName.name == data.name,
        data=data,
    )
    return schemas.FeatureName.model_validate(feature_name)


@feature_caches.with_update
async def update(
    session: AsyncSession,
    feature_name_id: int,
    data: schemas.FeatureNameUpdate,
) -> schemas.FeatureName:
    """Change the name of a feature.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    feature_name_id : int
        The id of the feature name to change.

    new_name : str
        The new name of the feature.

    Returns
    -------
    name : str
        The new name of the feature.

    Raises
    ------
    whombat.exceptions.DuplicateObjectError
        If the new name already exists.

    whombat.exceptions.NotFoundError
        If the old name does not exist.

    """
    feature_name = await common.update_object(
        session=session,
        model=models.FeatureName,
        condition=models.FeatureName.id == feature_name_id,
        data=data,
    )
    return schemas.FeatureName.model_validate(feature_name)


@feature_caches.with_clear
async def delete(
    session: AsyncSession,
    feature_name_id: int,
) -> schemas.FeatureName:
    """Delete a feature.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    feature_name_id : int
        The ID of the feature to delete.

    Returns
    -------
    name : str
        The name of the feature.

    """
    obj = await common.delete_object(
        session=session,
        model=models.FeatureName,
        condition=models.FeatureName.id == feature_name_id,
    )
    return schemas.FeatureName.model_validate(obj)


def find(
    features: Sequence[schemas.Feature],
    feature_name: str,
    default: Any = None,
) -> schemas.Feature | None:
    """Find a feature from a list of features by its name.

    Helper function for finding a feature by name. Returns the first feature
    with the given name, or a default value if no feature is found.

    Parameters
    ----------
    features : Sequence[schemas.Feature]
        The features to search.
    feature_name : str
        The name of the feature to find.
    default : Any, optional
        The default value to return if the feature is not found.

    Returns
    -------
    feature : schemas.Feature | None
        The feature, or the default value if the feature was not found.
    """
    return next(
        (f for f in features if f.feature_name.name == feature_name), default
    )
