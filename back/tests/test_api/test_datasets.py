"""Test suite for the datasets API module."""

import uuid
from collections.abc import Callable
from pathlib import Path

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import datasets, recordings


async def test_create_empty_dataset(session: AsyncSession, tmp_path: Path):
    """Test the creation of an empty dataset."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    dataset, recordings = await datasets.create(
        session,
        data=schemas.DatasetCreate(
            name="test_dataset",
            description="This is a test dataset.",
            audio_dir=audio_dir,
        ),
    )
    assert isinstance(dataset, schemas.Dataset)
    assert isinstance(recordings, list)
    assert dataset.name == "test_dataset"
    assert dataset.description == "This is a test dataset."
    assert dataset.audio_dir == audio_dir
    assert len(recordings) == 0


async def test_create_dataset_fails_if_name_is_not_unique(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test that creating a dataset fails if the name is not unique."""
    audio_dir1 = tmp_path / "audio1"
    audio_dir2 = tmp_path / "audio2"
    audio_dir1.mkdir()
    audio_dir2.mkdir()
    await datasets.create(
        session,
        data=schemas.DatasetCreate(
            name="test_dataset",
            description="This is a test dataset.",
            audio_dir=audio_dir1,
        ),
    )
    with pytest.raises(exceptions.DuplicateObjectError):
        await datasets.create(
            session,
            data=schemas.DatasetCreate(
                name="test_dataset",
                description="This is a test dataset.",
                audio_dir=audio_dir2,
            ),
        )


async def test_create_dataset_fails_if_audio_dir_is_not_unique(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test that creating a dataset fails if the audio dir is not unique."""
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir()
    await datasets.create(
        session,
        data=schemas.DatasetCreate(
            name="test_dataset",
            description="This is a test dataset.",
            audio_dir=audio_dir,
        ),
    )
    with pytest.raises(exceptions.DuplicateObjectError):
        await datasets.create(
            session,
            data=schemas.DatasetCreate(
                name="test_dataset_2",
                description="This is a test dataset.",
                audio_dir=audio_dir,
            ),
        )


async def test_get_dataset_by_uuid(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test getting a dataset by UUID."""
    retrieved_dataset = await datasets.get_by_uuid(
        session,
        dataset.uuid,
    )
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset.id == dataset.id


async def test_get_dataset_by_uuid_fails_when_uuid_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a dataset by UUID fails when nonexisting."""
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_by_uuid(
            session,
            uuid=uuid.uuid4(),
        )


async def test_get_dataset_by_name(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test getting a dataset by name."""
    retrieved_dataset = await datasets.get_by_name(session, dataset.name)
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset.id == dataset.id


async def test_get_dataset_by_name_fails_when_name_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a dataset by name fails when nonexisting."""
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_by_name(
            session,
            name="nonexisting_dataset",
        )


async def test_get_dataset_by_audio_dir(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test getting a dataset by audio directory."""
    retrieved_dataset = await datasets.get_by_audio_dir(
        session, dataset.audio_dir
    )
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset.id == dataset.id


async def test_get_dataset_by_audio_dir_fails_when_audio_dir_does_not_exist(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test getting a dataset by audio_dir fails if does not exist."""
    audio_dir = tmp_path / "nonexisting_audio_dir"
    audio_dir.mkdir()
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_by_audio_dir(
            session,
            audio_dir=audio_dir,
        )


async def test_get_datasets(session: AsyncSession, tmp_path: Path):
    """Test getting all datasets."""
    # Arrange
    audio_dir_1 = tmp_path / "audio_1"
    audio_dir_1.mkdir()
    dataset1, _ = await datasets.create(
        session,
        data=schemas.DatasetCreate(
            name="test_dataset_1",
            description="This is a test dataset.",
            audio_dir=audio_dir_1,
        ),
    )
    audio_dir_2 = tmp_path / "audio_2"
    audio_dir_2.mkdir()
    dataset2, _ = await datasets.create(
        session,
        data=schemas.DatasetCreate(
            name="test_dataset_2",
            description="This is a test dataset.",
            audio_dir=audio_dir_2,
        ),
    )

    # Act
    retrieved_datasets = await datasets.get_many(session)

    # Assert
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 2
    assert dataset1 in retrieved_datasets
    assert dataset2 in retrieved_datasets

    # Act (with limit)
    retrieved_datasets = await datasets.get_many(session, limit=1)

    # Assert
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 1
    assert dataset2 in retrieved_datasets

    # Act (with offset)
    retrieved_datasets = await datasets.get_many(session, offset=1)
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 1
    assert dataset1 in retrieved_datasets


async def test_update_dataset_name(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test updating a dataset's name."""
    assert dataset.name != "updated_dataset"
    updated_dataset = await datasets.update(
        session,
        dataset_id=dataset.id,
        data=schemas.DatasetUpdate(name="updated_dataset"),
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.name == "updated_dataset"


async def test_update_dataset_description(
    session: AsyncSession,
    dataset: schemas.Dataset,
):
    """Test updating a dataset's description."""
    updated_dataset = await datasets.update(
        session,
        dataset_id=dataset.id,
        data=schemas.DatasetUpdate(
            description="This is an updated test dataset."
        ),
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.description == "This is an updated test dataset."


async def test_update_dataset_audio_dir(
    session: AsyncSession, tmp_path: Path, dataset: schemas.Dataset
):
    """Test updating a dataset's audio directory."""
    audio_dir_2 = tmp_path / "audio_2"
    audio_dir_2.mkdir()
    updated_dataset = await datasets.update(
        session,
        dataset_id=dataset.id,
        data=schemas.DatasetUpdate(audio_dir=audio_dir_2),
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.audio_dir == audio_dir_2


async def test_delete_dataset(session: AsyncSession, dataset: schemas.Dataset):
    """Test deleting a dataset."""
    await datasets.delete(session, dataset_id=dataset.id)
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_by_id(session, dataset.id)


async def test_get_dataset_files(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test getting a dataset's files."""
    # Arrange
    audio_dir = dataset.audio_dir
    audio_file_1 = audio_dir / "audio_file_1.wav"
    audio_file_1.touch()
    audio_file_2 = audio_dir / "audio_file_2.wav"
    audio_file_2.touch()

    # Act
    retrieved_files = await datasets.get_state(session, dataset_id=dataset.id)

    # Assert
    assert isinstance(retrieved_files, list)
    assert len(retrieved_files) == 2

    assert {audio_file.path for audio_file in retrieved_files} == {
        audio_file_1.relative_to(audio_dir),
        audio_file_2.relative_to(audio_dir),
    }


async def test_get_dataset_files_with_existing_files(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test getting a dataset's files when some files already exist."""
    audio_dir = dataset.audio_dir
    path = random_wav_factory(audio_dir / "audio_file.wav")
    recording = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path),
    )

    await datasets.add_recording(
        session, dataset_id=dataset.id, recording_id=recording.id
    )

    retrieved_files = await datasets.get_state(session, dataset_id=dataset.id)

    assert len(retrieved_files) == 1
    assert retrieved_files[0].state == schemas.FileState.REGISTERED


async def test_get_dataset_files_with_missing_files(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test getting a dataset's files when some files are missing."""
    # Arrange
    audio_dir = dataset.audio_dir
    path = random_wav_factory(audio_dir / "audio_file.wav")

    recording = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path),
    )

    # add the recording to the dataset
    await datasets.add_recording(
        session, dataset_id=dataset.id, recording_id=recording.id
    )

    # delete the file
    path.unlink()

    # Act
    retrieved_files = await datasets.get_state(session, dataset_id=dataset.id)

    assert isinstance(retrieved_files, list)
    assert len(retrieved_files) == 1
    assert retrieved_files[0].state == schemas.FileState.MISSING


async def test_add_recording_to_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a recording to a dataset."""
    # Arrange
    audio_dir = dataset.audio_dir
    audio_file = random_wav_factory(path=audio_dir / "audio_file.wav")

    recording = await recordings.create(
        session, data=schemas.RecordingCreate(path=audio_file)
    )

    # Act
    await datasets.add_recording(
        session,
        dataset_id=dataset.id,
        recording_id=recording.id,
    )

    # Assert
    # Make sure the recording was added to the dataset
    query = select(models.DatasetRecording).where(
        models.DatasetRecording.dataset_id == dataset.id,
        models.DatasetRecording.recording_id == recording.id,
    )
    result = await session.execute(query)
    dataset_recording = result.unique().scalar_one_or_none()
    assert dataset_recording is not None


async def test_add_recording_to_dataset_with_nonexisting_recording(
    session: AsyncSession,
    dataset: schemas.Dataset,
):
    """Test adding a dataset recording when the recording does not exist."""
    # Arrange
    with pytest.raises(exceptions.NotFoundError):
        await datasets.add_recording(
            session,
            dataset_id=dataset.id,
            recording_id=10,
        )


async def test_get_dataset_recordings(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test getting a dataset's recordings."""
    # Arrange
    audio_dir = dataset.audio_dir
    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_1),
    )

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_2),
    )

    await datasets.add_recording(
        session,
        dataset_id=dataset.id,
        recording_id=recording_1.id,
    )
    await datasets.add_recording(
        session,
        dataset_id=dataset.id,
        recording_id=recording_2.id,
    )

    # Act
    retrieved_recordings = await datasets.get_recordings(
        session, dataset_id=dataset.id
    )

    # Assert
    assert isinstance(retrieved_recordings, list)
    assert len(retrieved_recordings) == 2
    assert isinstance(retrieved_recordings[0], schemas.DatasetRecording)
    assert isinstance(retrieved_recordings[1], schemas.DatasetRecording)
    assert retrieved_recordings[0].path == recording_1.path.relative_to(
        dataset.audio_dir
    )
    assert retrieved_recordings[1].path == recording_2.path.relative_to(
        dataset.audio_dir
    )


async def test_get_dataset_recordings_fails_with_nonexisting_dataset(
    session: AsyncSession,
):
    """Test getting a dataset's recordings when the dataset does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await datasets.get_recordings(
            session,
            dataset_id=10,
        )


async def test_add_file_to_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a file to a dataset."""
    # Arrange
    audio_dir = dataset.audio_dir
    path = random_wav_factory(
        path=audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    # Act
    await datasets.add_file(
        session,
        dataset_id=dataset.id,
        data=schemas.RecordingCreate(path=path),
    )

    # Assert
    # Make sure the recording was created
    query = select(models.Recording).where(
        models.Recording.path == str(path.absolute()),
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None

    # Make sure the recording was added to the dataset
    recording_list = await datasets.get_recordings(
        session,
        dataset_id=dataset.id,
    )

    assert len(recording_list) == 1
    assert recording_list[0].path == path.relative_to(dataset.audio_dir)


async def test_add_file_to_dataset_fails_if_file_not_in_audio_dir(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a file to a dataset fails if not in audio dir."""
    # Arrange
    audio_dir = dataset.audio_dir
    other_dir = audio_dir.parent / "other_dir"
    other_dir.mkdir()
    path = random_wav_factory(
        path=other_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    # Act
    with pytest.raises(ValueError):
        await datasets.add_file(
            session,
            dataset_id=dataset.id,
            data=schemas.RecordingCreate(path=path),
        )


async def test_add_file_to_dataset_with_existing_recording(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a file to a dataset that already exists in the dataset."""
    # Arrange
    audio_dir = dataset.audio_dir
    path = random_wav_factory(
        path=audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path),
    )

    # Act
    await datasets.add_file(
        session,
        dataset_id=dataset.id,
        data=schemas.RecordingCreate(path=path),
    )

    # Assert
    recording_list = await datasets.get_recordings(
        session,
        dataset_id=dataset.id,
    )

    assert len(recording_list) == 1
    assert recording_list[0].path == path.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding multiple recordings to a dataset."""
    # Arrange
    audio_dir = dataset.audio_dir
    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_1),
    )

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_2),
    )

    # Act
    added_paths = await datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2],
    )

    # Assert
    assert len(added_paths) == 2
    assert added_paths[0].path == path_1.relative_to(dataset.audio_dir)
    assert added_paths[1].path == path_2.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset_ignores_files_not_in_audio_dir(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding recordings to a dataset ignores files not in audio dir."""
    # Arrange
    audio_dir = dataset.audio_dir
    other_dir = audio_dir.parent / "other_dir"
    other_dir.mkdir()

    path_1 = random_wav_factory(path=audio_dir / "audio_file_1.wav")
    recording_1 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_1),
    )

    path_2 = random_wav_factory(path=other_dir / "audio_file_2.wav")
    recording_2 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_2),
    )

    # Act
    added_paths = await datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2],
    )

    # Assert
    assert len(added_paths) == 1
    assert added_paths[0].path == path_1.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset_ignores_duplicate_recordings(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding recordings to a dataset ignores duplicate recordings."""
    # Arrange
    audio_dir = dataset.audio_dir
    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_1),
    )

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_2),
    )

    # Act
    added_paths = await datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2, recording_1],
    )

    # Assert
    assert len(added_paths) == 2
    assert added_paths[0].path == path_1.relative_to(dataset.audio_dir)
    assert added_paths[1].path == path_2.relative_to(dataset.audio_dir)


async def test_add_recordings_to_dataset_ignores_recordings_already_in_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
):
    """Test adding multiple recordings ignores already in dataset."""
    # Arrange
    audio_dir = dataset.audio_dir
    path_1 = random_wav_factory(
        path=audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_1),
    )

    path_2 = random_wav_factory(
        path=audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await recordings.create(
        session,
        data=schemas.RecordingCreate(path=path_2),
    )

    await datasets.add_recording(
        session,
        dataset_id=dataset.id,
        recording_id=recording_2.id,
    )

    # Act
    added_paths = await datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2],
    )

    # Assert
    assert len(added_paths) == 1
    assert added_paths[0].path == path_1.relative_to(dataset.audio_dir)


async def test_create_dataset_registers_all_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    tmp_path: Path,
):
    """Test creating dataset registers all recordings in the directory."""
    audio_dir = tmp_path / "audio"

    if audio_dir.exists():
        audio_dir.rmdir()

    audio_dir.mkdir()
    audio_file_1 = random_wav_factory(path=audio_dir / "audio_file_1.wav")

    subdirectory = audio_dir / "subdirectory"
    subdirectory.mkdir()

    audio_file_2 = random_wav_factory(path=subdirectory / "audio_file_2.wav")

    text_file = audio_dir / "text_file.txt"
    text_file.touch()

    # Act
    dataset, recording_list = await datasets.create(
        session,
        data=schemas.DatasetCreate(
            name="test_dataset",
            description="This is a test dataset.",
            audio_dir=audio_dir,
        ),
    )

    # Assert
    assert isinstance(dataset, schemas.Dataset)
    assert dataset.audio_dir == audio_dir
    assert dataset.name == "test_dataset"
    assert dataset.description == "This is a test dataset."

    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.DatasetRecording)
    assert isinstance(recording_list[1], schemas.DatasetRecording)
    assert {recording_list[0].path, recording_list[1].path} == {
        audio_file_1.relative_to(audio_dir),
        audio_file_2.relative_to(audio_dir),
    }

    dataset_recordings = await datasets.get_recordings(
        session,
        dataset_id=dataset.id,
    )
    assert len(dataset_recordings) == 2
    assert dataset_recordings[0].path == audio_file_1.relative_to(audio_dir)
    assert dataset_recordings[1].path == audio_file_2.relative_to(audio_dir)
