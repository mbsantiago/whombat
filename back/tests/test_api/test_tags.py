"""Test suite for the tags Python API."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import tags
from whombat.database import models


async def test_create_tag(
    session: AsyncSession,
) -> None:
    """Test creating a tag."""
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    assert isinstance(created_tag, schemas.Tag)
    assert created_tag.key == "test_key"
    assert created_tag.value == "test_value"
    assert created_tag.id is not None

    # Check if it is in the database
    stmt = select(models.Tag).where(models.Tag.id == created_tag.id)
    result = await session.execute(stmt)
    tag = result.scalars().first()
    assert isinstance(tag, models.Tag)
    assert tag.key == "test_key"
    assert tag.value == "test_value"
    assert tag.id == created_tag.id


async def test_create_tag_duplicate_should_fail(
    session: AsyncSession,
) -> None:
    """Test creating a tag with a duplicate key."""
    await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )

    with pytest.raises(exceptions.DuplicateObjectError):
        await tags.create_tag(
            session=session,
            key="test_key",
            value="test_value",
        )


async def test_create_tag_with_long_key_should_fail(
    session: AsyncSession,
) -> None:
    """Test creating a tag with a long key."""
    with pytest.raises(ValueError):
        await tags.create_tag(
            session=session,
            key="a" * 256,
            value="test_value",
        )


async def test_create_tag_with_long_value_should_fail(
    session: AsyncSession,
) -> None:
    """Test creating a tag with a long value."""
    with pytest.raises(ValueError):
        await tags.create_tag(
            session=session,
            key="test_key",
            value="a" * 256,
        )


async def test_delete_tag(
    session: AsyncSession,
) -> None:
    """Test deleting a tag."""
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    # Check if it is in the database initially
    stmt = select(models.Tag).where(models.Tag.id == created_tag.id)
    result = await session.execute(stmt)
    tag = result.scalars().first()
    assert isinstance(tag, models.Tag)
    assert tag.key == "test_key"

    await tags.delete_tag(session=session, tag=created_tag)

    # Check if it is in the database
    stmt = select(models.Tag).where(models.Tag.id == created_tag.id)
    result = await session.execute(stmt)
    tag = result.scalars().first()
    assert tag is None


async def test_delete_tag_nonexistent_should_succeed(
    session: AsyncSession,
) -> None:
    """Test deleting a tag that does not exist."""
    tag = schemas.Tag(id=999999999, key="test_key", value="test_value")

    # Make sure it does not exist
    stmt = select(models.Tag).where(models.Tag.id == tag.id)
    result = await session.execute(stmt)
    db_tag = result.scalars().first()
    assert db_tag is None

    await tags.delete_tag(session, tag=tag)


async def test_get_tag_by_id(
    session: AsyncSession,
) -> None:
    """Test getting a tag by ID."""
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    retrieved_tag = await tags.get_tag_by_id(session, tag_id=created_tag.id)
    assert isinstance(retrieved_tag, schemas.Tag)
    assert retrieved_tag.id == created_tag.id
    assert retrieved_tag.key == "test_key"
    assert retrieved_tag.value == "test_value"


async def test_get_tag_by_id_nonexistent_should_fail(
    session: AsyncSession,
) -> None:
    """Test getting a tag by ID that does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await tags.get_tag_by_id(session, tag_id=999999999)


async def test_get_tag_by_key_and_value(
    session: AsyncSession,
) -> None:
    """Test getting a tag by key and value."""
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    retrieved_tag = await tags.get_tag_by_key_and_value(
        session=session,
        key="test_key",
        value="test_value",
    )
    assert isinstance(retrieved_tag, schemas.Tag)
    assert retrieved_tag.id == created_tag.id
    assert retrieved_tag.key == "test_key"
    assert retrieved_tag.value == "test_value"


async def test_get_tag_by_key_and_value_nonexistent_should_fail(
    session: AsyncSession,
) -> None:
    """Test getting a tag by key and value that does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await tags.get_tag_by_key_and_value(
            session=session,
            key="test_key",
            value="test_value",
        )


async def test_get_tags_by_key(
    session: AsyncSession,
) -> None:
    """Test getting tags by key."""
    await tags.create_tag(
        session=session,
        key="test_key1",
        value="test_value1",
    )
    created_tag2 = await tags.create_tag(
        session=session,
        key="test_key2",
        value="test_value2",
    )
    retrieved_tags = await tags.get_tags_by_key(
        session=session, key="test_key2"
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 1
    assert retrieved_tags[0] == created_tag2


async def test_get_tags_by_key_with_offset(
    session: AsyncSession,
) -> None:
    """Test getting tags by key with an offset."""
    await tags.create_tag(
        session=session,
        key="test_key1",
        value="test_value1",
    )
    await tags.create_tag(
        session=session,
        key="test_key2",
        value="test_value2",
    )
    tag = await tags.create_tag(
        session=session,
        key="test_key2",
        value="test_value3",
    )
    retrieved_tags = await tags.get_tags_by_key(
        session=session,
        key="test_key2",
        offset=1,
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 1
    assert retrieved_tags[0] == tag


async def test_get_tags_by_key_with_limit(
    session: AsyncSession,
) -> None:
    """Test getting tags by key with a limit."""
    await tags.create_tag(
        session=session,
        key="test_key1",
        value="test_value1",
    )
    tag1 = await tags.create_tag(
        session=session,
        key="test_key2",
        value="test_value2",
    )
    await tags.create_tag(
        session=session,
        key="test_key2",
        value="test_value3",
    )
    retrieved_tags = await tags.get_tags_by_key(
        session=session,
        key="test_key2",
        limit=1,
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 1
    assert retrieved_tags[0] == tag1


async def test_update_tag_key(
    session: AsyncSession,
) -> None:
    """Test updating a tag."""
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    updated_tag = await tags.update_tag(
        session=session,
        tag=created_tag,
        key="new_key",
    )
    assert isinstance(updated_tag, schemas.Tag)
    assert updated_tag.id == created_tag.id
    assert updated_tag.key == "new_key"
    assert updated_tag.value == "test_value"


async def test_update_tag_value(
    session: AsyncSession,
) -> None:
    """Test updating a tag."""
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    updated_tag = await tags.update_tag(
        session=session,
        tag=created_tag,
        value="new_value",
    )
    assert isinstance(updated_tag, schemas.Tag)
    assert updated_tag.id == created_tag.id
    assert updated_tag.key == "test_key"
    assert updated_tag.value == "new_value"


async def test_update_tag_nonexistent_should_succeed(
    session: AsyncSession,
) -> None:
    """Test updating a tag that does not exist."""
    tag = schemas.Tag(id=999999999, key="test_key", value="test_value")
    await tags.update_tag(
        session=session,
        tag=tag,
        key="new_key",
    )


async def test_get_or_create_tag_nonexistent_should_create(
    session: AsyncSession,
) -> None:
    """Test getting or creating a tag that does not exist."""
    created_tag = await tags.get_or_create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    assert isinstance(created_tag, schemas.Tag)
    assert created_tag.key == "test_key"
    assert created_tag.value == "test_value"


async def test_get_or_create_tag_existing_should_get(
    session: AsyncSession,
) -> None:
    """Test getting or creating a tag that already exists."""
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    retrieved_tag = await tags.get_or_create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    assert isinstance(retrieved_tag, schemas.Tag)
    assert retrieved_tag.id == created_tag.id
    assert retrieved_tag.key == "test_key"
    assert retrieved_tag.value == "test_value"
