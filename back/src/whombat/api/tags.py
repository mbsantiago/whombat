"""API functions to interact with tags."""

from cachetools import LRUCache
from sqlalchemy import and_, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, schemas
from whombat.api import common
from whombat.database import models
from whombat.filters.base import Filter

__all__ = [
    "create_tag",
    "delete_tag",
    "create_tags",
    "get_or_create_tag",
    "get_tag_by_id",
    "get_tag_by_key_and_value",
    "get_tags",
    "update_tag",
]


tag_caches = cache.CacheCollection(schemas.Tag)


@tag_caches.cached(
    name="tag_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, tag_id: tag_id,
    data_key=lambda tag: tag.id,
)
async def get_tag_by_id(
    session: AsyncSession,
    tag_id: int,
) -> schemas.Tag:
    """Get a tag by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    tag_id : int
        The ID of the tag.

    Returns
    -------
    schemas.Tag
        The tag.

    Raises
    ------
    exceptions.NotFoundError
        If the tag does not exist.
    """
    tag = await common.get_object(
        session=session,
        model=models.Tag,
        condition=models.Tag.id == tag_id,
    )
    return schemas.Tag.model_validate(tag)


@tag_caches.cached(
    name="tag_by_key_and_value",
    cache=LRUCache(maxsize=1000),
    key=lambda _, key, value: (key, value),
    data_key=lambda tag: (tag.key, tag.value),
)
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
    tag = await common.get_object(
        session=session,
        model=models.Tag,
        condition=and_(models.Tag.key == key, models.Tag.value == value),
    )
    return schemas.Tag.model_validate(tag)


async def get_tags(
    session: AsyncSession,
    *,
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

    filters : list[Filter], optional
        A list of filters to apply, by default None.

    Returns
    -------
    list[schemas.Tag]
        The tags.
    """
    tags = await common.get_objects(
        session=session,
        model=models.Tag,
        limit=limit,
        offset=offset,
        filters=filters,
    )
    return [schemas.Tag.model_validate(tag) for tag in tags]


@tag_caches.with_update
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
    tag = await common.create_object(
        session=session,
        model=models.Tag,
        data=data,
    )
    return schemas.Tag.model_validate(tag)


async def create_tags(
    session: AsyncSession,
    data: list[schemas.TagCreate],
) -> list[schemas.Tag]:
    """Create multiple tags simultaneously.

    This function does not raise an exception if a tag already exists.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    data: list[schemas.Tag]
        The tags to create.

    Returns
    -------
    list[schemas.Tag]
        Associated tags.
    """
    tags = await common.create_objects_without_duplicates(
        session=session,
        model=models.Tag,
        data=data,
        key=lambda tag: (tag.key, tag.value),
        key_column=tuple_(models.Tag.key, models.Tag.value),
    )
    return [schemas.Tag.model_validate(tag) for tag in tags]


@cache.cached(
    name="tag_by_key_and_value",
    key=lambda _, data: (data.key, data.value),
)
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
    tag = await common.get_or_create_object(
        session=session,
        model=models.Tag,
        condition=and_(
            models.Tag.key == data.key, models.Tag.value == data.value
        ),
        data=data,
    )
    return schemas.Tag.model_validate(tag)


@tag_caches.with_update
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

    tag_id : int
        The ID of the tag to update.

    data : schemas.TagUpdate
        The data to update.

    Returns
    -------
    schemas.Tag
        The updated tag.

    Raises
    ------
    exceptions.NotFoundError
        If the tag does not exist.

    """
    tag = await common.update_object(
        session=session,
        model=models.Tag,
        condition=models.Tag.id == tag_id,
        data=data,
    )
    return schemas.Tag.model_validate(tag)


@tag_caches.with_clear
async def delete_tag(session: AsyncSession, tag_id: int) -> schemas.Tag:
    """Delete a tag.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    tag_id : int
        The id of the tag to delete.
    """
    obj = await common.delete_object(
        session=session,
        model=models.Tag,
        condition=models.Tag.id == tag_id,
    )
    return schemas.Tag.model_validate(obj)
