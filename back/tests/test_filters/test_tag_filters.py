"""Test suite for tag filters."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, filters, schemas


@pytest.fixture(autouse=True)
async def setup_test(session: AsyncSession):
    """Set up the test."""
    tags_to_create = [
        schemas.TagCreate(key="a", value="b1"),
        schemas.TagCreate(key="a", value="b2"),
        schemas.TagCreate(key="b", value="c1"),
        schemas.TagCreate(key="b", value="c2"),
        schemas.TagCreate(key="c", value="a1"),
        schemas.TagCreate(key="c", value="a2"),
        schemas.TagCreate(key="ab", value="bc1"),
        schemas.TagCreate(key="ab", value="bc2"),
        schemas.TagCreate(key="bc", value="ca1"),
        schemas.TagCreate(key="bc", value="ca2"),
        schemas.TagCreate(key="ca", value="ab1"),
        schemas.TagCreate(key="ca", value="ab2"),
    ]

    await api.tags.get_or_create_tags(session, tags_to_create)


async def test_filter_by_exact_key(session: AsyncSession):
    """Test filtering by exact key."""
    # Act
    tags = await api.tags.get_tags(
        session,
        filters=[filters.tags.KeyFilter(eq="a")]
    )

    # Assert.
    assert len(tags) == 2
    assert all(tag.key == "a" for tag in tags)


async def test_filter_by_has_key(session: AsyncSession):
    """Test filtering by has key."""
    # Act
    tags = await api.tags.get_tags(
        session,
        filters=[filters.tags.KeyFilter(has="a")]
    )

    # Assert.
    assert len(tags) == 6
    assert all("a" in tag.key for tag in tags)


async def test_filter_by_exact_value(session: AsyncSession):
    """Test filtering by exact value."""
    # Act
    tags = await api.tags.get_tags(
        session,
        filters=[filters.tags.ValueFilter(eq="a1")]
    )

    # Assert.
    assert len(tags) == 1
    assert all(tag.value == "a1" for tag in tags)


async def test_filter_by_has_value(session: AsyncSession):
    """Test filtering by has value."""
    # Act
    tags = await api.tags.get_tags(
        session,
        filters=[filters.tags.ValueFilter(has="a")]
    )

    # Assert.
    assert len(tags) == 6
    assert all("a" in tag.value for tag in tags)


async def test_filter_by_search(session: AsyncSession):
    """Test filtering by search."""
    # Act
    tags = await api.tags.get_tags(
        session,
        filters=[filters.tags.SearchFilter(query="a")]
    )

    # Assert.
    assert len(tags) == 10
    assert all("a" in tag.key or "a" in tag.value for tag in tags)
