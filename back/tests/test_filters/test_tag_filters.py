"""Test suite for tag filters."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api
from whombat.filters import tags as tag_filters


@pytest.fixture(autouse=True)
async def setup_test(session: AsyncSession):
    """Set up the test."""
    tags_to_create = [
        dict(key="a", value="b1"),
        dict(key="a", value="b2"),
        dict(key="b", value="c1"),
        dict(key="b", value="c2"),
        dict(key="c", value="a1"),
        dict(key="c", value="a2"),
        dict(key="ab", value="bc1"),
        dict(key="ab", value="bc2"),
        dict(key="bc", value="ca1"),
        dict(key="bc", value="ca2"),
        dict(key="ca", value="ab1"),
        dict(key="ca", value="ab2"),
    ]

    await api.tags.create_many(session, tags_to_create)


async def test_filter_by_exact_key(session: AsyncSession):
    """Test filtering by exact key."""
    # Act
    tags, _ = await api.tags.get_many(
        session, filters=[tag_filters.KeyFilter(eq="a")]
    )

    # Assert.
    assert len(tags) == 2
    assert all(tag.key == "a" for tag in tags)


async def test_filter_by_has_key(session: AsyncSession):
    """Test filtering by has key."""
    # Act
    tags, _ = await api.tags.get_many(
        session, filters=[tag_filters.KeyFilter(has="a")]
    )

    # Assert.
    assert len(tags) == 6
    assert all("a" in tag.key for tag in tags)


async def test_filter_by_exact_value(session: AsyncSession):
    """Test filtering by exact value."""
    # Act
    tags, _ = await api.tags.get_many(
        session, filters=[tag_filters.ValueFilter(eq="a1")]
    )

    # Assert.
    assert len(tags) == 1
    assert all(tag.value == "a1" for tag in tags)


async def test_filter_by_has_value(session: AsyncSession):
    """Test filtering by has value."""
    # Act
    tags, _ = await api.tags.get_many(
        session, filters=[tag_filters.ValueFilter(has="a")]
    )

    # Assert.
    assert len(tags) == 6
    assert all("a" in tag.value for tag in tags)


async def test_filter_by_search(session: AsyncSession):
    """Test filtering by search."""
    # Act
    tags, _ = await api.tags.get_many(
        session, filters=[tag_filters.SearchFilter(search="a")]
    )

    # Assert.
    assert len(tags) == 10
    assert all("a" in tag.key or "a" in tag.value for tag in tags)
