"""API functions to interact with tags."""

from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.database import models
from whombat.schemas.tags import TagCreate, TagUpdate


async def create_tag(
    session: AsyncSession,
    key: str,
    value: str,
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
    data = TagCreate(key=key, value=value)
    tag = models.Tag(**data.dict())

    try:
        session.add(tag)
        await session.commit()
    except IntegrityError as e:
        raise exceptions.DuplicateObjectError("Tag already exists.") from e

    return schemas.Tag.from_orm(tag)


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
    stmt = delete(models.Tag).where(models.Tag.id == tag.id)
    await session.execute(stmt)
    await session.commit()


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
    stmt = select(models.Tag).where(models.Tag.id == tag_id)
    result = await session.execute(stmt)
    tag = result.scalar()
    if tag is None:
        raise exceptions.NotFoundError("Tag not found.")
    return schemas.Tag.from_orm(tag)


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
    stmt = select(models.Tag).where(
        models.Tag.key == key,
        models.Tag.value == value,
    )
    result = await session.execute(stmt)
    tag = result.scalar()
    if tag is None:
        raise exceptions.NotFoundError("Tag not found.")
    return schemas.Tag.from_orm(tag)


async def get_tags_by_key(
    session: AsyncSession,
    key: str,
    limit: int = 1000,
    offset: int = 0,
) -> list[schemas.Tag]:
    """Get all tags with a given key.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    key : str
        The key of the tags.
    limit : int, optional
        The maximum number of tags to return, by default 1000.
    offset : int, optional
        The number of tags to skip, by default 0.

    Returns
    -------
    list[schemas.Tag]
        The tags.
    """
    stmt = (
        select(models.Tag)
        .where(models.Tag.key == key)
        .limit(limit)
        .offset(offset)
    )
    result = await session.execute(stmt)
    tags = result.scalars()
    return [schemas.Tag.from_orm(tag) for tag in tags]


async def get_tags(
    session: AsyncSession,
    limit: int = 1000,
    offset: int = 0,
) -> list[schemas.Tag]:
    """Get all tags.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    limit : int, optional
        The maximum number of tags to return, by default 1000.
    offset : int, optional

    Returns
    -------
    list[schemas.Tag]
        The tags.
    """
    stmt = select(models.Tag).limit(limit).offset(offset)
    result = await session.execute(stmt)
    tags = result.scalars()
    return [schemas.Tag.from_orm(tag) for tag in tags]


async def update_tag(
    session: AsyncSession,
    tag: schemas.Tag,
    key: str | None = None,
    value: str | None = None,
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

    Notes
    -----
    This function will not raise an exception if the tag does not exist.
    """
    data = TagUpdate(key=key, value=value)
    stmt = (
        update(models.Tag)
        .where(models.Tag.id == tag.id)
        .values(**data.dict(exclude_none=True))
    )
    await session.execute(stmt)
    await session.commit()
    return schemas.Tag(
        **{
            **tag.dict(),
            **data.dict(exclude_none=True),
        }
    )


async def get_or_create_tag(
    session: AsyncSession,
    key: str,
    value: str,
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
    try:
        tag = await get_tag_by_key_and_value(session, key, value)
    except exceptions.NotFoundError:
        tag = await create_tag(session, key, value)
    return tag
