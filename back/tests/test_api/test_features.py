"""Test suite for the features API module."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import features


async def test_create_feature_name(
    session: AsyncSession,
) -> None:
    """Test creating a feature."""
    # Arrange.
    # Create the feature.
    name = "test_feature"

    # Act.
    feature_name = await features.create_feature_name(
        session, data=schemas.FeatureNameCreate(name=name)
    )

    # Assert.
    assert isinstance(feature_name, schemas.FeatureName)
    assert feature_name.name == name
    assert feature_name.id is not None

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
    await features.create_feature_name(
        session, data=schemas.FeatureNameCreate(name=name)
    )

    # Act.
    with pytest.raises(exceptions.DuplicateObjectError):
        await features.create_feature_name(
            session, data=schemas.FeatureNameCreate(name=name)
        )


async def test_delete_feature_name(
    session: AsyncSession,
) -> None:
    """Test deleting a feature."""
    # Arrange.
    # Create the feature.
    name = "test_feature"
    feature_name = await features.create_feature_name(
        session, data=schemas.FeatureNameCreate(name=name)
    )

    # Act.
    await features.delete_feature_name(
        session, feature_name_id=feature_name.id
    )

    # Assert.
    # Check that the feature does not exist.
    query = select(models.FeatureName.name).where(
        models.FeatureName.name == name
    )
    result = await session.execute(query)
    assert result.scalar_one_or_none() is None


# TODO: Create tests to check that deleting a
# feature name deletes all associated features.


async def test_change_feature_name(
    session: AsyncSession,
) -> None:
    """Test changing a feature name."""
    # Arrange.
    # Create the feature.
    name = "test_feature"
    feature_name = await features.create_feature_name(
        session, data=schemas.FeatureNameCreate(name=name)
    )

    # Act.
    new_name = "new_test_feature"
    await features.update_feature_name(
        session,
        feature_name_id=feature_name.id,
        data=schemas.FeatureNameUpdate(name=new_name),
    )

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
    name = "test_feature"
    new_name = "new_test_feature"
    feature_name = await features.create_feature_name(
        session, data=schemas.FeatureNameCreate(name=name)
    )
    await features.create_feature_name(
        session, data=schemas.FeatureNameCreate(name=new_name)
    )

    # Act.
    with pytest.raises(exceptions.DuplicateObjectError):
        await features.update_feature_name(
            session,
            feature_name.id,
            data=schemas.FeatureNameUpdate(name=new_name),
        )


async def test_change_feature_name_fails_if_nonexistent(
    session: AsyncSession,
) -> None:
    """Test changing a feature name fails if the feature does not exist."""
    # Act.
    with pytest.raises(exceptions.NotFoundError):
        await features.update_feature_name(
            session, 1, data=schemas.FeatureNameUpdate(name="new_test_feature")
        )


async def test_get_feature_names(
    session: AsyncSession,
) -> None:
    """Test getting all feature names."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(
            session, data=schemas.FeatureNameCreate(name=name)
        )

    # Act.
    result = await features.get_feature_names(session)

    # Assert.
    assert [feat.name for feat in result] == names


async def test_get_feature_names_with_limit(
    session: AsyncSession,
) -> None:
    """Test getting all feature names with a limit."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(
            session, data=schemas.FeatureNameCreate(name=name)
        )

    # Act.
    result = await features.get_feature_names(session, limit=2)

    # Assert.
    assert [feat.name for feat in result] == names[:2]


async def test_get_feature_names_with_offset(
    session: AsyncSession,
) -> None:
    """Test getting all feature names with an offset."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(
            session, data=schemas.FeatureNameCreate(name=name)
        )

    # Act.
    result = await features.get_feature_names(session, offset=1)

    # Assert.
    assert [feat.name for feat in result] == names[1:]


async def test_get_features_with_return_all(
    session: AsyncSession,
) -> None:
    """Test getting all feature names with a limit of zero."""
    # Arrange.
    # Create the features.
    names = ["test_feature_1", "test_feature_2", "test_feature_3"]
    for name in names:
        await features.create_feature_name(
            session, data=schemas.FeatureNameCreate(name=name)
        )

    # Act.
    result = await features.get_feature_names(session, limit=-1)

    # Assert.
    assert [feat.name for feat in result] == names
