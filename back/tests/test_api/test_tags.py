"""Test suite for the tags Python API."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import tags


async def test_create_tag(
    session: AsyncSession,
) -> None:
    """Test creating a tag."""
    created_tag = await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
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
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
    )

    with pytest.raises(exceptions.DuplicateObjectError):
        await tags.create(
            session=session,
            data=schemas.TagCreate(
                key="test_key",
                value="test_value",
            ),
        )


async def test_create_tag_with_long_key_should_fail(
    session: AsyncSession,
) -> None:
    """Test creating a tag with a long key."""
    with pytest.raises(ValueError):
        await tags.create(
            session=session,
            data=schemas.TagCreate(
                key="a" * 256,
                value="test_value",
            ),
        )


async def test_create_tag_with_long_value_should_fail(
    session: AsyncSession,
) -> None:
    """Test creating a tag with a long value."""
    with pytest.raises(ValueError):
        await tags.create(
            session=session,
            data=schemas.TagCreate(
                key="test_key",
                value="a" * 256,
            ),
        )


async def test_delete_tag(
    session: AsyncSession,
) -> None:
    """Test deleting a tag."""
    # Arrange
    created_tag = await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
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
    await tags.delete(session=session, tag_id=created_tag.id)

    # Assert
    # Check it is not in the database anymore
    stmt = select(models.Tag).where(
        models.Tag.key == "test_key",
        models.Tag.value == "test_value",
    )
    result = await session.execute(stmt)
    tag = result.scalars().first()
    assert tag is None


async def test_delete_tag_nonexistent_should_fail(
    session: AsyncSession,
) -> None:
    """Test deleting a tag that does not exist."""
    tag = schemas.Tag(id=3, key="test_key", value="test_value")

    # Make sure it does not exist
    stmt = select(models.Tag).where(
        models.Tag.key == "test_key",
        models.Tag.value == "test_value",
    )
    result = await session.execute(stmt)
    db_tag = result.scalars().first()
    assert db_tag is None

    with pytest.raises(exceptions.NotFoundError):
        await tags.delete(session, tag_id=tag.id)


async def test_get_tag_by_key_and_value(
    session: AsyncSession,
) -> None:
    """Test getting a tag by key and value."""
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
    )
    retrieved_tag = await tags.get_by_tag_and_value(
        session,
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
        await tags.get_by_tag_and_value(
            session,
            key="test_key",
            value="test_value",
        )


async def test_update_tag_key(
    session: AsyncSession,
) -> None:
    """Test updating a tag."""
    created_tag = await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
    )
    updated_tag = await tags.update(
        session=session,
        tag_id=created_tag.id,
        data=schemas.TagUpdate(
            key="new_key",
        ),
    )
    assert isinstance(updated_tag, schemas.Tag)
    assert updated_tag.key == "new_key"
    assert updated_tag.value == "test_value"


async def test_update_tag_value(
    session: AsyncSession,
) -> None:
    """Test updating a tag."""
    created_tag = await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
    )
    updated_tag = await tags.update(
        session=session,
        tag_id=created_tag.id,
        data=schemas.TagUpdate(value="new_value"),
    )
    assert isinstance(updated_tag, schemas.Tag)
    assert updated_tag.key == "test_key"
    assert updated_tag.value == "new_value"


async def test_update_tag_nonexistent_should_fail(
    session: AsyncSession,
) -> None:
    """Test updating a tag that does not exist."""
    tag = schemas.Tag(id=3, key="test_key", value="test_value")
    with pytest.raises(exceptions.NotFoundError):
        await tags.update(
            session=session,
            tag_id=tag.id,
            data=schemas.TagUpdate(key="new_key"),
        )


async def test_get_or_create_tag_nonexistent_should_create(
    session: AsyncSession,
) -> None:
    """Test getting or creating a tag that does not exist."""
    created_tag = await tags.get_or_create(
        session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
    )
    assert isinstance(created_tag, schemas.Tag)
    assert created_tag.key == "test_key"
    assert created_tag.value == "test_value"


async def test_get_or_create_tag_existing_should_get(
    session: AsyncSession,
) -> None:
    """Test getting or creating a tag that already exists."""
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
    )
    retrieved_tag = await tags.get_or_create(
        session,
        data=schemas.TagCreate(
            key="test_key",
            value="test_value",
        ),
    )
    assert isinstance(retrieved_tag, schemas.Tag)
    assert retrieved_tag.key == "test_key"
    assert retrieved_tag.value == "test_value"


async def test_get_tags(
    session: AsyncSession,
):
    """Test getting tags."""
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key1",
            value="test_value1",
        ),
    )
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key2",
            value="test_value2",
        ),
    )
    retrieved_tags, _ = await tags.get_many(session)
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
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key1",
            value="test_value1",
        ),
    )
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key2",
            value="test_value2",
        ),
    )
    await tags.create(
        session=session,
        data=schemas.TagCreate(
            key="test_key3",
            value="test_value3",
        ),
    )
    retrieved_tags, _ = await tags.get_many(
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
    await tags.create(
        session=session,
        data=schemas.TagCreate(key="test_key1", value="test_value1"),
    )
    await tags.create(
        session=session,
        data=schemas.TagCreate(key="test_key2", value="test_value2"),
    )
    await tags.create(
        session=session,
        data=schemas.TagCreate(key="test_key3", value="test_value3"),
    )
    retrieved_tags, _ = await tags.get_many(
        session=session,
        limit=2,
    )
    assert isinstance(retrieved_tags, list)
    assert len(retrieved_tags) == 2
    assert retrieved_tags[0].key == "test_key1"
    assert retrieved_tags[0].value == "test_value1"
    assert retrieved_tags[1].key == "test_key2"
    assert retrieved_tags[1].value == "test_value2"


async def test_get_or_create_tags_with_nonexisting_tags(session: AsyncSession):
    """Test getting or creating tags."""
    # Arrange
    tags_to_create = [
        schemas.TagCreate(key="test_key1", value="test_value1"),
        schemas.TagCreate(key="test_key2", value="test_value2"),
    ]

    # Act
    created_tags = await tags.create_many(
        session=session,
        data=tags_to_create,
    )

    # Assert
    assert isinstance(created_tags, list)
    assert len(created_tags) == 2
    assert isinstance(created_tags[0], schemas.Tag)
    assert created_tags[0].key == "test_key1"
    assert created_tags[0].value == "test_value1"
    assert isinstance(created_tags[1], schemas.Tag)
    assert created_tags[1].key == "test_key2"
    assert created_tags[1].value == "test_value2"


async def test_get_or_create_tags_with_existing_tags(session: AsyncSession):
    """Test getting or creating tags."""
    # Arrange
    tags_to_create = [
        schemas.TagCreate(key="test_key1", value="test_value1"),
        schemas.TagCreate(key="test_key2", value="test_value2"),
    ]
    await tags.create(
        session=session,
        data=schemas.TagCreate(key="test_key1", value="test_value1"),
    )
    await tags.create(
        session=session,
        data=schemas.TagCreate(key="test_key2", value="test_value2"),
    )

    # Act
    created_tags = await tags.create_many(
        session=session,
        data=tags_to_create,
    )

    # Assert
    assert len(created_tags) == 0


async def test_get_or_create_tags_with_existing_and_nonexisting_tags(
    session: AsyncSession,
):
    """Test getting or creating tags, when some exist and others dont."""
    # Arrange
    tags_to_create = [
        schemas.TagCreate(key="test_key1", value="test_value1"),
        schemas.TagCreate(key="test_key2", value="test_value2"),
    ]
    await tags.create(
        session=session,
        data=schemas.TagCreate(key="test_key1", value="test_value1"),
    )

    # Act
    created_tags = await tags.create_many(
        session=session,
        data=tags_to_create,
    )

    # Assert
    assert len(created_tags) == 1
    assert created_tags[0].key == "test_key2"
    assert created_tags[0].value == "test_value2"
