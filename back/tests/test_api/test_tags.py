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

    # Check if it is in the database
    stmt = select(models.Tag).where(
        models.Tag.key == "test_key",
        models.Tag.value == "test_value",
    )
    result = await session.execute(stmt)
    tag = result.scalars().first()
    assert isinstance(tag, models.Tag)
    assert tag.key == "test_key"
    assert tag.value == "test_value"
    assert tag.id is not None


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
    # Arrange
    created_tag = await tags.create_tag(
        session=session,
        key="test_key",
        value="test_value",
    )
    # Check if it is in the database initially
    stmt = select(models.Tag).where(
        models.Tag.key == "test_key",
        models.Tag.value == "test_value",
    )
    result = await session.execute(stmt)
    tag = result.scalars().first()
    assert isinstance(tag, models.Tag)
    assert tag.key == "test_key"

    # Act
    await tags.delete_tag(session=session, tag=created_tag)

    # Assert
    # Check it is not in the database anymore
    stmt = select(models.Tag).where(
        models.Tag.key == "test_key",
        models.Tag.value == "test_value",
    )
    result = await session.execute(stmt)
    tag = result.scalars().first()
    assert tag is None


async def test_delete_tag_nonexistent_should_succeed(
    session: AsyncSession,
) -> None:
    """Test deleting a tag that does not exist."""
    tag = schemas.Tag(key="test_key", value="test_value")

    # Make sure it does not exist
    stmt = select(models.Tag).where(
        models.Tag.key == "test_key",
        models.Tag.value == "test_value",
    )
    result = await session.execute(stmt)
    db_tag = result.scalars().first()
    assert db_tag is None

    await tags.delete_tag(session, tag=tag)


async def test_get_tag_by_key_and_value(
    session: AsyncSession,
) -> None:
    """Test getting a tag by key and value."""
    await tags.create_tag(
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
    assert updated_tag.key == "test_key"
    assert updated_tag.value == "new_value"


async def test_update_tag_nonexistent_should_succeed(
    session: AsyncSession,
) -> None:
    """Test updating a tag that does not exist."""
    tag = schemas.Tag(key="test_key", value="test_value")
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
    await tags.create_tag(
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
    assert retrieved_tag.key == "test_key"
    assert retrieved_tag.value == "test_value"


async def test_get_tags(
    session: AsyncSession,
):
    """Test getting tags."""
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
    retrieved_tags = await tags.get_tags(session)
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 2
    assert retrieved_tags[0].key == "test_key1"
    assert retrieved_tags[0].value == "test_value1"
    assert retrieved_tags[1].key == "test_key2"
    assert retrieved_tags[1].value == "test_value2"


async def test_get_tags_with_offset(
    session: AsyncSession,
):
    """Test getting tags with an offset."""
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
    await tags.create_tag(
        session=session,
        key="test_key3",
        value="test_value3",
    )
    retrieved_tags = await tags.get_tags(
        session=session,
        offset=1,
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 2
    assert retrieved_tags[0].key == "test_key2"
    assert retrieved_tags[0].value == "test_value2"
    assert retrieved_tags[1].key == "test_key3"
    assert retrieved_tags[1].value == "test_value3"


async def test_get_tags_with_limit(
    session: AsyncSession,
):
    """Test getting tags with a limit."""
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
    await tags.create_tag(
        session=session,
        key="test_key3",
        value="test_value3",
    )
    retrieved_tags = await tags.get_tags(
        session=session,
        limit=2,
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 2
    assert retrieved_tags[0].key == "test_key1"
    assert retrieved_tags[0].value == "test_value1"
    assert retrieved_tags[1].key == "test_key2"
    assert retrieved_tags[1].value == "test_value2"


async def test_get_tags_with_search(
    session: AsyncSession,
):
    """Test getting tags with a search."""
    await tags.create_tag(
        session=session,
        key="a",
        value="b",
    )
    await tags.create_tag(
        session=session,
        key="b",
        value="c",
    )
    await tags.create_tag(
        session=session,
        key="c",
        value="d",
    )
    retrieved_tags = await tags.get_tags(
        session=session,
        search="b",
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 2
    assert retrieved_tags[0].key == "a"
    assert retrieved_tags[0].value == "b"
    assert retrieved_tags[1].key == "b"
    assert retrieved_tags[1].value == "c"


async def test_get_tags_by_key_with_search(
    session: AsyncSession,
):
    """Test getting tags by key with a search."""
    await tags.create_tag(
        session=session,
        key="a",
        value="b",
    )
    await tags.create_tag(
        session=session,
        key="c",
        value="b",
    )
    await tags.create_tag(
        session=session,
        key="c",
        value="d",
    )
    retrieved_tags = await tags.get_tags_by_key(
        session=session,
        key="c",
        search="b",
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 1
    assert retrieved_tags[0].key == "c"
    assert retrieved_tags[0].value == "b"
