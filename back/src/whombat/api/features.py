"""API functions to interact with feature names."""

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.database import models

__all__ = [
    "create_feature_name",
    "delete_feature_name",
    "change_feature_name",
    "get_feature_names",
]


async def _get_or_create_feature_names(
    session: AsyncSession,
    feature_names: list[str],
) -> dict[str, schemas.FeatureName]:
    """Get or create feature names.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    feature_names : list[str]
        The names of the features.

    Returns
    -------
    feature_names : list[models.FeatureName]
        The feature names.

    """
    names = [feature_name for feature_name in feature_names]

    # Get existing feature names.
    query = select(models.FeatureName).where(
        models.FeatureName.name.in_(names)
    )
    result = await session.execute(query)
    db_feature_names = result.scalars().all()
    db_feature_names = {f.name: f for f in db_feature_names}

    # Create the feature names that do not exist.
    missing_feature_names = set(names) - set(db_feature_names.keys())
    if missing_feature_names:
        for name in missing_feature_names:
            feature = models.FeatureName(name=name)
            session.add(feature)
            db_feature_names[name] = feature
        await session.commit()

    return {
        name: schemas.FeatureName.model_validate(f)
        for name, f in db_feature_names.items()
    }


async def create_feature_name(
    session: AsyncSession, name: str
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
    # Create the feature.
    feature = models.FeatureName(name=name)
    try:
        session.add(feature)
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise exceptions.DuplicateObjectError(
            f"A feature with the name '{name}' already exists."
        ) from e

    return schemas.FeatureName.model_validate(feature)


async def delete_feature_name(
    session: AsyncSession,
    feature_name: schemas.FeatureName,
) -> None:
    """Delete a feature.

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

    Notes
    -----
    This function does not raise an error if the feature does not exist.

    Warning
    -------
    This function does not check if the feature is being used.
    It will delete the feature regardless and any associated features.

    """
    # Delete the feature.
    stm = delete(models.FeatureName)

    if feature_name.id is not None:
        stm = stm.where(models.FeatureName.id == feature_name.id)
    else:
        stm = stm.where(models.FeatureName.name == feature_name.name)

    await session.execute(stm)


async def change_feature_name(
    session: AsyncSession,
    feature_name_id: int,
    new_name: str,
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
    # Change the name of the feature.
    query = select(models.FeatureName).where(
        models.FeatureName.id == feature_name_id
    )
    result = await session.execute(query)
    feature_name = result.scalars().first()

    if feature_name is None:
        raise exceptions.NotFoundError(
            f"A feature with the id '{feature_name_id}' does not exist."
        )

    try:
        feature_name.name = new_name
        session.add(feature_name)
        await session.commit()
    except IntegrityError as e:
        raise exceptions.DuplicateObjectError(
            f"A feature with the name '{new_name}' already exists."
        ) from e

    return schemas.FeatureName.model_validate(feature_name)


async def get_feature_names(
    session: AsyncSession,
    search: str | None = None,
    limit: int = 1000,
    offset: int = 0,
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
    query = select(models.FeatureName)
    if search is not None:
        query = query.where(models.FeatureName.name.ilike(f"%{search}%"))
    query = query.order_by(models.FeatureName.name.asc())
    query = query.limit(limit).offset(offset)
    result = await session.execute(query)
    rows = result.scalars().all()
    return [schemas.FeatureName.model_validate(r) for r in rows]


async def get_or_create_feature_name(
    session: AsyncSession, name: str
) -> schemas.FeatureName:
    """Get or create a feature name.

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

    """
    feature_names = await _get_or_create_feature_names(session, [name])
    return feature_names[name]


async def get_or_create_feature(
    session: AsyncSession,
    name: str,
    value: float,
) -> schemas.Feature:
    """Get or create a feature.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    name : str
        The name of the feature.
    value : float
        The value of the feature.

    Returns
    -------
    feature : schemas.Feature
        The feature.

    """
    feature_name = await get_or_create_feature_name(session, name)
    return schemas.Feature(feature_name=feature_name, value=value)
