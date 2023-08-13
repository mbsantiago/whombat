"""API functions to interact with feature names."""

from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import schemas
from whombat.api import common
from whombat.database import models
from whombat.filters.base import Filter

__all__ = [
    "create_feature_name",
    "create_feature_names",
    "delete_feature_name",
    "get_feature_name_by_id",
    "get_feature_name_by_name",
    "get_feature_names",
    "update_feature_name",
]


async def get_feature_name_by_id(
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


async def get_feature_name_by_name(
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


async def get_feature_names(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
) -> list[schemas.FeatureName]:
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
    db_feature_names = await common.get_objects(
        session=session,
        model=models.FeatureName,
        limit=limit,
        offset=offset,
        filters=filters,
    )
    return [schemas.FeatureName.model_validate(r) for r in db_feature_names]


async def create_feature_name(
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


async def create_feature_names(
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
    feature_names = await common.create_objects(
        session=session,
        model=models.FeatureName,
        data=data,
        avoid_duplicates=True,
        key=lambda x: x.name,
        key_column=models.FeatureName.name,
    )
    return [schemas.FeatureName.model_validate(r) for r in feature_names]


async def get_or_create_feature_name(
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


async def update_feature_name(
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


async def delete_feature_name(
    session: AsyncSession,
    feature_name_id: int,
) -> None:
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
    await common.delete_object(
        session=session,
        model=models.FeatureName,
        condition=models.FeatureName.id == feature_name_id,
    )
