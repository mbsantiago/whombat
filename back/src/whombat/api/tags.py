"""API functions to interact with tags."""

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.database import models
from whombat.filters.base import Filter

__all__ = [
    "create_tag",
    "delete_tag",
    "get_tag_by_key_and_value",
    "get_tags",
    "update_tag",
]


async def _create_tag(
    session: AsyncSession,
    data: schemas.TagCreate,
) -> models.Tag:
    """Create a new tag.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    key : str
        The key of the tag.
    value : str
        The value of the tag.

    Returns
    -------
    models.Tag
        The created tag.

    Raises
    ------
    exceptions.DuplicateObjectError
        If a tag with the same key and value already exists.
    """
    tag = models.Tag(**data.model_dump())

    try:
        session.add(tag)
        await session.commit()
    except IntegrityError as e:
        raise exceptions.DuplicateObjectError("Tag already exists.") from e

    return tag


async def create_tag(
    session: AsyncSession,
    data: schemas.TagCreate,
) -> schemas.Tag:
    """Create a new tag.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    key : str
        The key of the tag.
    value : str
        The value of the tag.

    Returns
    -------
    schemas.Tag
        The created tag.

    Raises
    ------
    exceptions.DuplicateObjectError
        If a tag with the same key and value already exists.
    """
    tag = await _create_tag(session, data)
    return schemas.Tag.model_validate(tag)


async def delete_tag(
    session: AsyncSession,
    tag: schemas.Tag,
) -> None:
    """Delete a tag.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    tag : schemas.Tag
        The tag to delete.

    Notes
    -----
    This function will not raise an exception if the tag does not exist.
    """
    stmt = delete(models.Tag).where(
        models.Tag.key == tag.key,
        models.Tag.value == tag.value,
    )
    await session.execute(stmt)
    await session.commit()


async def _get_tag_by_key_and_value(
    session: AsyncSession,
    key: str,
    value: str,
) -> models.Tag:
    """Get a tag by its key and value.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    key : str
        The key of the tag.
    value : str
        The value of the tag.

    Returns
    -------
    models.Tag
        The tag.

    Raises
    ------
    exceptions.NotFoundError
        If the tag does not exist.
    """
    stmt = select(models.Tag).where(
        models.Tag.key == key,
        models.Tag.value == value,
    )
    result = await session.execute(stmt)
    tag = result.scalar()
    if tag is None:
        raise exceptions.NotFoundError("Tag not found.")
    return tag


async def get_tag_by_key_and_value(
    session: AsyncSession,
    key: str,
    value: str,
) -> schemas.Tag:
    """Get a tag by its key and value.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    key : str
        The key of the tag.
    value : str
        The value of the tag.

    Returns
    -------
    schemas.Tag
        The tag.

    Raises
    ------
    exceptions.NotFoundError
        If the tag does not exist.
    """
    tag = await _get_tag_by_key_and_value(session, key, value)
    return schemas.Tag.model_validate(tag)


async def get_tags(
    session: AsyncSession,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
) -> list[schemas.Tag]:
    """Get all tags.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    limit : int, optional
        The maximum number of tags to return, by default 1000. If
        -1 is given, all tags will be returned.
    offset : int, optional
        The number of tags to skip, by default 0.
    search : str, optional
        A search string to filter tags by, by default None. If None, no
        filtering will be done. The search string is matched against the
        concatenation of the key and value of each tag.

    Returns
    -------
    list[schemas.Tag]
        The tags.
    """
    query = select(models.Tag)

    for filter_ in filters or []:
        query = filter_.filter(query)

    query = query.limit(limit).offset(offset)
    result = await session.execute(query)
    tags = result.scalars()
    return [schemas.Tag.model_validate(tag) for tag in tags]


async def update_tag(
    session: AsyncSession,
    tag_id: int,
    data: schemas.TagUpdate,
) -> schemas.Tag:
    """Update a tag.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    tag : schemas.Tag
        The tag to update.
    key : str, optional
        The new key of the tag, by default None. If None, the key will not be
        updated.
    value : str, optional
        The new value of the tag, by default None. If None, the value will not
        be updated.

    Returns
    -------
    schemas.Tag
        The updated tag.

    Raises
    ------
    exceptions.NotFoundError
        If the tag does not exist.

    """
    # Get the tag by id
    query = select(models.Tag).where(models.Tag.id == tag_id)
    result = await session.execute(query)
    tag = result.scalar()

    if tag is None:
        raise exceptions.NotFoundError("Tag not found.")

    # Update the tag
    if data.key is not None:
        tag.key = data.key

    if data.value is not None:
        tag.value = data.value

    await session.commit()
    return schemas.Tag.model_validate(tag)


async def _get_or_create_tag(
    session: AsyncSession,
    data: schemas.TagCreate,
) -> models.Tag:
    """Get a tag by its key and value, or create it if it does not exist.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    key : str
        The key of the tag.
    value : str
        The value of the tag.

    Returns
    -------
    models.Tag
        The tag.
    """
    try:
        tag = await _get_tag_by_key_and_value(session, data.key, data.value)
    except exceptions.NotFoundError:
        tag = await _create_tag(session, data)
    return tag


async def get_or_create_tag(
    session: AsyncSession,
    data: schemas.TagCreate,
) -> schemas.Tag:
    """Get a tag by its key and value, or create it if it does not exist.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    key : str
        The key of the tag.
    value : str
        The value of the tag.

    Returns
    -------
    schemas.Tag
        The tag.
    """
    tag = await _get_or_create_tag(session, data)
    return schemas.Tag.model_validate(tag)


async def _get_or_create_tags(
    session: AsyncSession,
    tags: list[schemas.TagCreate],
) -> list[models.Tag]:
    """Create multiple tags simultaneously.

    This function does not raise an exception if a tag already exists.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    tags : list[schemas.Tag]
        The tags to create.

    Returns
    -------
    list[schemas.Tag]
        The created tags.
    """
    tag_keys = [tag.key for tag in tags]
    tag_values = [tag.value for tag in tags]

    # Get existing tags
    query = select(models.Tag).where(
        models.Tag.key.in_(tag_keys),
        models.Tag.value.in_(tag_values),
    )
    result = await session.execute(query)
    existing_tags = {(tag.key, tag.value): tag for tag in result.scalars()}

    # Collect tags to create
    missing_tags = [
        tag for tag in tags if (tag.key, tag.value) not in existing_tags
    ]

    if missing_tags:
        for tag in missing_tags:
            mtag = models.Tag(**tag.model_dump())
            existing_tags[(tag.key, tag.value)] = mtag
            session.add(mtag)

        await session.commit()

    return [existing_tags[(tag.key, tag.value)] for tag in tags]


async def get_or_create_tags(
    session: AsyncSession,
    tags: list[schemas.TagCreate],
) -> list[schemas.Tag]:
    """Create multiple tags simultaneously.

    This function does not raise an exception if a tag already exists.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    tags : list[schemas.Tag]
        The tags to create.

    Returns
    -------
    list[schemas.Tag]
        The created tags.
    """
    mtags = await _get_or_create_tags(session, tags)
    return [schemas.Tag.model_validate(tag) for tag in mtags]
