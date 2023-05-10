"""Test suite for the datasets API module."""

import uuid
from pathlib import Path

import pytest
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import datasets


async def test_create_dataset(session: AsyncSession, tmp_path: Path):
    """Test the creation of a dataset."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    assert isinstance(dataset, schemas.Dataset)
    assert dataset.name == "test_dataset"
    assert dataset.description == "This is a test dataset."
    assert dataset.audio_dir == audio_dir


async def test_create_dataset_fails_when_audio_dir_does_not_exist(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test that creating a dataset fails when the audio directory does not exist."""
    audio_dir = tmp_path / "audio"
    with pytest.raises(ValidationError):
        await datasets.create_empty_dataset(
            session,
            name="test_dataset",
            description="This is a test dataset.",
            audio_dir=audio_dir,
        )


async def test_create_dataset_fails_when_audio_dir_is_not_a_directory(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test creating a dataset fails when the audio_dir is not a directory."""
    audio_dir = tmp_path / "audio"
    audio_dir.touch()
    with pytest.raises(ValidationError):
        await datasets.create_empty_dataset(
            session,
            name="test_dataset",
            description="This is a test dataset.",
            audio_dir=audio_dir,
        )


async def test_create_dataset_fails_if_name_is_not_unique(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test that creating a dataset fails if the name is not unique."""
    audio_dir1 = tmp_path / "audio1"
    audio_dir2 = tmp_path / "audio2"
    audio_dir1.mkdir()
    audio_dir2.mkdir()
    await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir1,
    )
    with pytest.raises(ValueError):
        await datasets.create_empty_dataset(
            session,
            name="test_dataset",
            description="This is a test dataset.",
            audio_dir=audio_dir2,
        )


async def test_create_dataset_fails_if_audio_dir_is_not_unique(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test that creating a dataset fails if the audio directory is not unique."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    with pytest.raises(ValueError):
        await datasets.create_empty_dataset(
            session,
            name="test_dataset_2",
            description="This is a test dataset.",
            audio_dir=audio_dir,
        )


async def test_get_dataset_by_uuid(session: AsyncSession, tmp_path: Path):
    """Test getting a dataset by UUID."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    retrieved_dataset = await datasets.get_dataset_by_uuid(
        session,
        dataset.uuid,
    )
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset == dataset


async def test_get_dataset_by_uuid_fails_when_uuid_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a dataset by UUID fails when the UUID does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_dataset_by_uuid(
            session,
            uuid=uuid.uuid4(),
        )


async def test_get_dataset_by_name(session: AsyncSession, tmp_path: Path):
    """Test getting a dataset by name."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    retrieved_dataset = await datasets.get_dataset_by_name(
        session, dataset.name
    )
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset == dataset


async def test_get_dataset_by_name_fails_when_name_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a dataset by name fails when the name does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_dataset_by_name(
            session,
            name="test_dataset",
        )


async def test_get_dataset_by_audio_dir(session: AsyncSession, tmp_path: Path):
    """Test getting a dataset by audio directory."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    retrieved_dataset = await datasets.get_dataset_by_audio_dir(
        session, dataset.audio_dir
    )
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset == dataset


async def test_get_dataset_by_audio_dir_fails_when_audio_dir_does_not_exist(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test getting a dataset by audio_dir fails if does not exist."""
    audio_dir = tmp_path / "audio"
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_dataset_by_audio_dir(
            session,
            audio_dir=audio_dir,
        )


async def test_get_datasets(session: AsyncSession, tmp_path: Path):
    """Test getting all datasets."""
    # Arrange
    audio_dir_1 = tmp_path / "audio_1"
    audio_dir_1.mkdir()
    dataset1 = await datasets.create_empty_dataset(
        session,
        name="test_dataset_1",
        description="This is a test dataset.",
        audio_dir=audio_dir_1,
    )
    audio_dir_2 = tmp_path / "audio_2"
    audio_dir_2.mkdir()
    dataset2 = await datasets.create_empty_dataset(
        session,
        name="test_dataset_2",
        description="This is a test dataset.",
        audio_dir=audio_dir_2,
    )

    # Act
    retrieved_datasets = await datasets.get_datasets(session)

    # Assert
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 2
    assert dataset1 in retrieved_datasets
    assert dataset2 in retrieved_datasets

    # Act (with limit)
    retrieved_datasets = await datasets.get_datasets(session, limit=1)

    # Assert
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 1
    assert dataset1 in retrieved_datasets

    # Act (with offset)
    retrieved_datasets = await datasets.get_datasets(session, offset=1)
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 1
    assert dataset2 in retrieved_datasets


async def test_update_dataset_name(session: AsyncSession, tmp_path: Path):
    """Test updating a dataset's name."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    updated_dataset = await datasets.update_dataset(
        session,
        dataset,
        name="updated_dataset",
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.name == "updated_dataset"


async def test_update_dataset_description(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test updating a dataset's description."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    updated_dataset = await datasets.update_dataset(
        session,
        dataset,
        description="This is an updated test dataset.",
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.description == "This is an updated test dataset."


async def test_update_dataset_audio_dir(session: AsyncSession, tmp_path: Path):
    """Test updating a dataset's audio directory."""
    audio_dir_1 = tmp_path / "audio_1"
    audio_dir_1.mkdir()
    audio_dir_2 = tmp_path / "audio_2"
    audio_dir_2.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir_1,
    )
    updated_dataset = await datasets.update_dataset(
        session,
        dataset,
        audio_dir=audio_dir_2,
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.audio_dir == audio_dir_2


async def test_delete_dataset(session: AsyncSession, tmp_path: Path):
    """Test deleting a dataset."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    await datasets.get_dataset_by_uuid(session, dataset.uuid)
    await datasets.delete_dataset(session, dataset)
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_dataset_by_uuid(session, dataset.uuid)


async def test_get_dataset_files(session: AsyncSession, tmp_path: Path):
    """Test getting a dataset's files."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )
    audio_file_1 = audio_dir / "audio_file_1.wav"
    audio_file_1.touch()
    audio_file_2 = audio_dir / "audio_file_2.wav"
    audio_file_2.touch()

    # Act
    retrieved_files = await datasets.get_dataset_files(session, dataset)

    # Assert
    assert isinstance(retrieved_files, list)
    assert len(retrieved_files) == 2

    assert {audio_file.path for audio_file in retrieved_files} == {
        audio_file_1.relative_to(audio_dir),
        audio_file_2.relative_to(audio_dir),
    }

    # TODO: add registered recordings and missing recordings
