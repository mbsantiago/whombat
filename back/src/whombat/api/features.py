"""API functions to interact with feature names."""

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.database import models

__all__ = [
    "create_feature_name",
    "delete_feature_name",
    "change_feature_name",
    "get_feature_names",
    "create_feature",
]


async def create_feature_name(
    session: AsyncSession,
    name: str,
) -> str:
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

    return name


async def delete_feature_name(
    session: AsyncSession,
    name: str,
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
    query = select(models.FeatureName).where(models.FeatureName.name == name)
    result = await session.execute(query)
    feature = result.scalar_one_or_none()

    if feature is None:
        return

    await session.delete(feature)
    await session.commit()


async def change_feature_name(
    session: AsyncSession,
    old_name: str,
    new_name: str,
) -> str:
    """Change the name of a feature.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    old_name : str
        The old name of the feature.
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
    query = (
        update(models.FeatureName)
        .where(models.FeatureName.name == old_name)
        .values(name=new_name)
    )

    try:
        result = await session.execute(query)
        await session.commit()
    except IntegrityError as e:
        raise exceptions.DuplicateObjectError(
            f"A feature with the name '{new_name}' already exists."
        ) from e

    if result.rowcount == 0:  # type: ignore
        raise exceptions.NotFoundError(
            f"A feature with the name '{old_name}' does not exist."
        )

    return new_name


async def get_feature_names(
    session: AsyncSession,
    search: str | None = None,
    limit: int = 1000,
    offset: int = 0,
) -> list[str]:
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
    query = select(models.FeatureName.name)
    if search is not None:
        query = query.where(models.FeatureName.name.ilike(f"%{search}%"))
    query = query.order_by(models.FeatureName.name.asc())
    query = query.limit(limit).offset(offset)
    result = await session.execute(query)
    rows = result.all()
    return [row[0] for row in rows]


async def create_feature(
    session: AsyncSession,
    name: str,
    value: float,
) -> schemas.Feature:
    """Create a feature.

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
        The created feature.

    """
    # Create the feature.
    try:
        name = await create_feature_name(session, name)
    except exceptions.DuplicateObjectError:
        pass

    return schemas.Feature(
        name=name,
        value=value,
    )


async def get_or_create_feature_name(
    session: AsyncSession,
    name: str,
) -> str:
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
    try:
        name = await create_feature_name(session, name)
        return name
    except exceptions.DuplicateObjectError:
        return name
