"""Test suite for the datasets API module."""

import uuid
from collections.abc import Callable
from pathlib import Path

import pytest
import sqlalchemy.orm as orm
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import datasets, recordings
from whombat.database import models


async def test_create_empty_dataset(session: AsyncSession, tmp_path: Path):
    """Test the creation of an empty dataset."""
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
    """Test that creating a dataset fails when the audio dir does not exist."""
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
    """Test that creating a dataset fails if the audio dir is not unique."""
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
    """Test that getting a dataset by UUID fails when nonexisting."""
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
    """Test that getting a dataset by name fails when nonexisting."""
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


async def test_get_dataset_files_with_existing_files(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test getting a dataset's files when some files already exist."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    path = random_wav_factory(audio_dir / "audio_file.wav")

    recording = await recordings.create_recording(
        session,
        path=path,
    )

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    await datasets.add_recording_to_dataset(session, recording, dataset)

    retrieved_files = await datasets.get_dataset_files(session, dataset)

    assert isinstance(retrieved_files, list)
    assert len(retrieved_files) == 1
    assert retrieved_files[0].state == schemas.FileState.REGISTERED


async def test_get_dataset_files_with_missing_files(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    tmp_path: Path,
):
    """Test getting a dataset's files when some files are missing."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    path = random_wav_factory(audio_dir / "audio_file.wav")

    recording = await recordings.create_recording(
        session,
        path=path,
    )

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    # add the recording to the dataset
    await datasets.add_recording_to_dataset(session, recording, dataset)

    # move the file outside of the audio directory
    path.rename(tmp_path / "audio_file.wav")

    # Act
    retrieved_files = await datasets.get_dataset_files(session, dataset)

    assert isinstance(retrieved_files, list)
    assert len(retrieved_files) == 1
    assert retrieved_files[0].state == schemas.FileState.MISSING



async def test_add_recording_to_dataset(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    tmp_path: Path,
):
    """Test adding a recording to a dataset."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    audio_file = random_wav_factory(
        path=audio_dir / "audio_file.wav",
    )

    recording = await recordings.create_recording(
        session,
        path=audio_file,
    )

    # Act
    await datasets.add_recording_to_dataset(
        session,
        recording,
        dataset,
    )

    # Assert
    # Make sure the recording was added to the dataset
    query = (
        select(models.DatasetRecording)
        .join(
            models.DatasetRecording.recording,
        )
        .join(
            models.DatasetRecording.dataset,
        )
        .options(
            orm.joinedload(models.DatasetRecording.recording),
            orm.joinedload(models.DatasetRecording.dataset),
        )
        .where(
            models.Dataset.uuid == dataset.uuid,
            models.Recording.hash == recording.hash,
        )
    )
    result = await session.execute(query)
    dataset_recording = result.scalars().first()
    assert isinstance(dataset_recording, models.DatasetRecording)
    assert dataset_recording.recording.hash == recording.hash
    assert dataset_recording.dataset.uuid == dataset.uuid
    assert dataset_recording.path == str(audio_file.relative_to(audio_dir))


async def test_add_recording_to_dataset_with_nonexisting_recording(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a dataset recording when the recording does not exist."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path = random_wav_factory(
        path=audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    recording = schemas.Recording.from_file(path)

    # Act
    await datasets.add_recording_to_dataset(
        session,
        recording,
        dataset,
    )

    # Assert
    # Make sure the recording was created
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash,
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None

    # Make sure the recording was added to the dataset
    query = (
        select(models.DatasetRecording)
        .join(
            models.DatasetRecording.recording,
        )
        .join(
            models.DatasetRecording.dataset,
        )
        .options(
            orm.joinedload(models.DatasetRecording.recording),
            orm.joinedload(models.DatasetRecording.dataset),
        )
        .where(
            models.Dataset.uuid == dataset.uuid,
            models.Recording.hash == recording.hash,
        )
    )
    result = await session.execute(query)
    dataset_recording = result.scalars().first()
    assert dataset_recording is not None
    assert dataset_recording.recording.hash == recording.hash
    assert dataset_recording.dataset.uuid == dataset.uuid


async def test_add_recording_to_dataset_is_idempotent(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a recording to a dataset twice."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path = random_wav_factory(
        path=audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    recording = schemas.Recording.from_file(path)

    # Act
    await datasets.add_recording_to_dataset(
        session,
        recording,
        dataset,
    )
    await datasets.add_recording_to_dataset(
        session,
        recording,
        dataset,
    )

    # Assert
    dataset_recordings = await datasets.get_dataset_recordings(
        session,
        dataset,
    )
    assert len(dataset_recordings) == 1


async def test_get_dataset_recordings(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test getting a dataset's recordings."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = schemas.Recording.from_file(path_1)

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = schemas.Recording.from_file(path_2)

    await datasets.add_recording_to_dataset(
        session,
        recording_1,
        dataset,
    )
    await datasets.add_recording_to_dataset(
        session,
        recording_2,
        dataset,
    )

    # Act
    retrieved_recordings = await datasets.get_dataset_recordings(
        session, dataset
    )

    # Assert
    assert isinstance(retrieved_recordings, list)
    assert len(retrieved_recordings) == 2
    assert isinstance(retrieved_recordings[0], schemas.Recording)
    assert isinstance(retrieved_recordings[1], schemas.Recording)
    assert retrieved_recordings[0].hash == recording_1.hash
    assert retrieved_recordings[0].path == recording_1.path.relative_to(
        dataset.audio_dir
    )
    assert retrieved_recordings[1].hash == recording_2.hash
    assert retrieved_recordings[1].path == recording_2.path.relative_to(
        dataset.audio_dir
    )


async def test_get_dataset_recordings_fails_with_nonexisting_dataset(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test getting a dataset's recordings when the dataset does not exist."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = schemas.Dataset(
        uuid=uuid.uuid4(),
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_dataset_recordings(
            session,
            dataset,
        )


async def test_add_file_to_dataset(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a file to a dataset."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path = random_wav_factory(
        path=audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    # Act
    await datasets.add_file_to_dataset(
        session,
        path,
        dataset,
    )

    # Assert
    # Make sure the recording was created
    query = select(models.Recording).where(
        models.Recording.path == str(path.absolute()),
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None

    # Make sure the recording was added to the dataset
    recording_list = await datasets.get_dataset_recordings(
        session,
        dataset,
    )

    assert len(recording_list) == 1
    assert recording_list[0].path == path.relative_to(dataset.audio_dir)


async def test_add_file_to_dataset_fails_if_file_not_in_audio_dir(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a file to a dataset fails if not in audio dir."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path = random_wav_factory(
        path=tmp_path / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    # Act
    with pytest.raises(ValueError):
        await datasets.add_file_to_dataset(
            session,
            path,
            dataset,
        )


async def test_add_file_to_dataset_with_existing_recording(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a file to a dataset that already exists in the dataset."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path = random_wav_factory(
        path=audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    await recordings.create_recording(
        session,
        path,
    )

    # Act
    await datasets.add_file_to_dataset(
        session,
        path,
        dataset,
    )

    # Assert

    # Make sure the recording was added to the dataset
    recording_list = await datasets.get_dataset_recordings(
        session,
        dataset,
    )

    assert len(recording_list) == 1
    assert recording_list[0].path == path.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding multiple recordings to a dataset."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await recordings.create_recording(
        session,
        path_1,
    )

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await recordings.create_recording(
        session,
        path_2,
    )

    # Act
    added_paths = await datasets.add_recordings_to_dataset(
        session,
        [recording_1, recording_2],
        dataset,
    )

    # Assert
    assert len(added_paths) == 2
    assert added_paths[0] == path_1.relative_to(dataset.audio_dir)
    assert added_paths[1] == path_2.relative_to(dataset.audio_dir)

    # Make sure the recordings were added to the dataset
    recording_list = await datasets.get_dataset_recordings(
        session,
        dataset,
    )

    assert len(recording_list) == 2
    assert recording_list[0].path == path_1.relative_to(dataset.audio_dir)
    assert recording_list[1].path == path_2.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset_ignores_files_not_in_audio_dir(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding recordings to a dataset ignores files not in audio dir."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path_1 = random_wav_factory(path=audio_dir / "audio_file_1.wav")
    recording_1 = await recordings.create_recording(
        session,
        path_1,
    )

    path_2 = random_wav_factory(path=tmp_path / "audio_file_2.wav")
    recording_2 = await recordings.create_recording(
        session,
        path_2,
    )

    # Act
    added_paths = await datasets.add_recordings_to_dataset(
        session,
        [recording_1, recording_2],
        dataset,
    )

    # Assert
    assert len(added_paths) == 1
    assert added_paths[0] == path_1.relative_to(dataset.audio_dir)

    # Make sure the recordings were added to the dataset
    recording_list = await datasets.get_dataset_recordings(
        session,
        dataset,
    )

    assert len(recording_list) == 1
    assert recording_list[0].path == path_1.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset_ignores_duplicate_recordings(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding recordings to a dataset ignores duplicate recordings."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await recordings.create_recording(
        session,
        path_1,
    )

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await recordings.create_recording(
        session,
        path_2,
    )

    # Act
    added_paths = await datasets.add_recordings_to_dataset(
        session,
        [recording_1, recording_2, recording_1],
        dataset,
    )

    # Assert
    assert len(added_paths) == 2
    assert added_paths[0] == path_1.relative_to(dataset.audio_dir)
    assert added_paths[1] == path_2.relative_to(dataset.audio_dir)

    # Make sure the recordings were added to the dataset
    recording_list = await datasets.get_dataset_recordings(
        session,
        dataset,
    )

    assert len(recording_list) == 2
    assert recording_list[0].path == path_1.relative_to(dataset.audio_dir)
    assert recording_list[1].path == path_2.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset_ignores_recordings_already_in_dataset(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding multiple recordings ignores already in dataset."""
    # Arrange
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await recordings.create_recording(
        session,
        path_1,
    )

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await recordings.create_recording(
        session,
        path_2,
    )

    await datasets.add_recording_to_dataset(
        session,
        recording_2,
        dataset,
    )

    # Act
    added_paths = await datasets.add_recordings_to_dataset(
        session,
        [recording_1, recording_2],
        dataset,
    )

    # Assert
    assert len(added_paths) == 1
    assert added_paths[0] == path_1.relative_to(dataset.audio_dir)

    # Make sure the recordings were added to the dataset
    recording_list = await datasets.get_dataset_recordings(
        session,
        dataset,
    )

    assert len(recording_list) == 2
    assert recording_list[0].path == path_1.relative_to(dataset.audio_dir)
    assert recording_list[1].path == path_2.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset_ignores_unregistered_recordings(
    session: AsyncSession,
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test adding multiple recordings ignores unregistered recordings."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    dataset = await datasets.create_empty_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    path_1 = random_wav_factory(path=audio_dir / "audio_file_1.wav")
    recording_1 = await recordings.create_recording(
        session,
        path_1,
    )

    path_2 = random_wav_factory(path=audio_dir / "audio_file_2.wav")
    recording_2 = schemas.Recording.from_file(path_2)

    # Act
    added_paths = await datasets.add_recordings_to_dataset(
        session,
        [recording_1, recording_2],
        dataset,
    )

    # Assert
    assert len(added_paths) == 1
    assert added_paths[0] == path_1.relative_to(dataset.audio_dir)

    # Make sure the recordings were added to the dataset
    recording_list = await datasets.get_dataset_recordings(
        session,
        dataset,
    )
    assert len(recording_list) == 1
    assert recording_list[0].path == path_1.relative_to(dataset.audio_dir)


async def test_create_dataset_registers_all_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    tmp_path: Path,
):
    """Test creating dataset registers all recordings in the audio directory."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()

    audio_file_1 = random_wav_factory(path=audio_dir / "audio_file_1.wav")

    subdirectory = audio_dir / "subdirectory"
    subdirectory.mkdir()

    audio_file_2 = random_wav_factory(path=subdirectory / "audio_file_2.wav")

    text_file = audio_dir / "text_file.txt"
    text_file.touch()

    # Act
    dataset, recording_list = await datasets.create_dataset(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(dataset, schemas.Dataset)
    assert dataset.audio_dir == audio_dir
    assert dataset.name == "test_dataset"
    assert dataset.description == "This is a test dataset."

    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert isinstance(recording_list[1], schemas.Recording)
    assert recording_list[0].path == audio_file_1.relative_to(audio_dir)
    assert recording_list[1].path == audio_file_2.relative_to(audio_dir)

    dataset_recordings = await datasets.get_dataset_recordings(
        session,
        dataset,
    )
    assert len(dataset_recordings) == 2
    assert dataset_recordings[0].path == audio_file_1.relative_to(audio_dir)
    assert dataset_recordings[1].path == audio_file_2.relative_to(audio_dir)
