"""Test suite for the features API module."""

from collections.abc import Callable
from pathlib import Path

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import features, recordings
from whombat.database import models


async def test_create_feature_name(
    session: AsyncSession,
) -> None:
    """Test creating a feature."""
    # Arrange.
    # Create the feature.
    name = "test_feature"

    # Act.
    feature_name = await features.create_feature_name(session, name)

    # Assert.
    assert feature_name == name

    # Check that the feature exists.
    query = select(models.FeatureName.name).where(
        models.FeatureName.name == name
    )
    result = await session.execute(query)
    assert result.scalar_one_or_none() == name


async def test_create_feature_name_fails_if_duplicate(
    session: AsyncSession,
) -> None:
    """Test creating a feature fails if the feature already exists."""
    # Arrange.
    # Create the feature.
    name = "test_feature"
    feature = models.FeatureName(name=name)
    session.add(feature)
    await session.commit()

    # Act.
    with pytest.raises(exceptions.DuplicateObjectError):
        await features.create_feature_name(session, name)


async def test_delete_feature_name(
    session: AsyncSession,
) -> None:
    """Test deleting a feature."""
    # Arrange.
    # Create the feature.
    name = "test_feature"
    feature = models.FeatureName(name=name)
    session.add(feature)
    await session.commit()

    # Act.
    await features.delete_feature_name(session, name)

    # Assert.
    # Check that the feature does not exist.
    query = select(models.FeatureName.name).where(
        models.FeatureName.name == name
    )
    result = await session.execute(query)
    assert result.scalar_one_or_none() is None


async def test_delete_feature_name_is_idempotent(
    session: AsyncSession,
) -> None:
    """Test deleting a feature is idempotent."""
    # Arrange.
    # Create the feature.
    name = "test_feature"
    feature = models.FeatureName(name=name)
    session.add(feature)
    await session.commit()

    # Act.
    await features.delete_feature_name(session, name)
    await features.delete_feature_name(session, name)

    # Assert.
    # Check that the feature does not exist.
    query = select(models.FeatureName.name).where(
        models.FeatureName.name == name
    )
    result = await session.execute(query)
    assert result.scalar_one_or_none() is None


async def test_delete_feature_name_deletes_recording_features(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
) -> None:
    """Test deleting a feature name deletes the recording features."""
    # Arrange.

    # Create the feature.
    name = await features.create_feature_name(session, "test_feature")

    # Create a recording
    path = random_wav_factory()
    recording = await recordings.create_recording(
        session,
        path,
    )

    # Check there are no recording features.
    query = select(models.RecordingFeature)
    result = await session.execute(query)
    assert result.scalars().all() == []

    # Create a recording feature.
    await recordings.add_feature_to_recording(
        session,
        schemas.Feature(
            name=name,
            value=1,
        ),
        recording,
    )

    # Act.
    await features.delete_feature_name(session, name)

    # Assert.

    # Check that the feature name does not exist.
    query = select(models.FeatureName.name).where(
        models.FeatureName.name == name
    )
    result = await session.execute(query)
    assert result.scalar_one_or_none() is None

    # Check that the recording feature does not exist.
    query = select(models.RecordingFeature)
    result = await session.execute(query)
    assert result.scalars().all() == []


async def test_change_feature_name(
    session: AsyncSession,
) -> None:
    """Test changing a feature name."""
    # Arrange.
    # Create the feature.
    name = await features.create_feature_name(session, "test_feature")

    # Act.
    new_name = "new_test_feature"
    await features.change_feature_name(session, name, new_name)

    # Assert.
    # Check that the feature does not exist.
    query = select(models.FeatureName.name).where(
        models.FeatureName.name == name
    )
    result = await session.execute(query)
    assert result.scalar_one_or_none() is None

    # Check that the new feature exists.
    query = select(models.FeatureName.name).where(
        models.FeatureName.name == new_name
    )
    result = await session.execute(query)
    assert result.scalar_one_or_none() == new_name


async def test_change_feature_name_fails_if_duplicate(
    session: AsyncSession,
) -> None:
    """Test changing a feature name fails if the new name already exists."""
    # Arrange.
    # Create the feature.
    name = await features.create_feature_name(session, "test_feature")
    new_name = await features.create_feature_name(session, "new_test_feature")

    # Act.
    with pytest.raises(exceptions.DuplicateObjectError):
        await features.change_feature_name(session, name, new_name)


async def test_change_feature_name_fails_if_nonexistent(
    session: AsyncSession,
) -> None:
    """Test changing a feature name fails if the feature does not exist."""
    # Arrange.
    # Create the feature.
    name = "test_feature"

    # Act.
    with pytest.raises(exceptions.NotFoundError):
        await features.change_feature_name(session, name, "new_test_feature")


async def test_get_feature_names(
    session: AsyncSession,
) -> None:
    """Test getting all feature names."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(session, name)

    # Act.
    result = await features.get_feature_names(session)

    # Assert.
    assert result == names


async def test_get_feature_names_with_limit(
    session: AsyncSession,
) -> None:
    """Test getting all feature names with a limit."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(session, name)

    # Act.
    result = await features.get_feature_names(session, limit=2)

    # Assert.
    assert result == names[:2]


async def test_get_feature_names_with_offset(
    session: AsyncSession,
) -> None:
    """Test getting all feature names with an offset."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(session, name)

    # Act.
    result = await features.get_feature_names(session, offset=1)

    # Assert.
    assert result == names[1:]


async def test_get_features_with_return_all(
    session: AsyncSession,
) -> None:
    """Test getting all feature names with a limit of zero."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(session, name)

    # Act.
    result = await features.get_feature_names(session, limit=-1)

    # Assert.
    assert result == names


async def test_get_features_with_search(
    session: AsyncSession,
) -> None:
    """Test getting all feature names with a search string."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(session, name)

    # Act.
    result = await features.get_feature_names(session, search="1")

    # Assert.
    assert result == ["test_feature_1"]


async def test_create_feature_with_nonexistent_name(
    session: AsyncSession,
) -> None:
    """Test creating a feature."""
    # Arrange.
    name = "test_feature"
    value = 1

    # Act.
    await features.create_feature(session, name, value)

    # Assert.
    # Check that the feature exists.
    query = select(models.FeatureName).where(models.FeatureName.name == name)
    result = await session.execute(query)
    assert result.scalar_one_or_none() is not None


async def test_create_feature_with_existing_name(
    session: AsyncSession,
) -> None:
    """Test creating a feature with an existing name."""
    # Arrange.
    name = "test_feature"
    value = 1
    await features.create_feature_name(session, name)

    # Act.
    feature = await features.create_feature(session, name, value)

    assert feature.name == name
    assert feature.value == value
