"""Test suite for the datasets API module."""

import uuid
from collections.abc import Callable
from pathlib import Path

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_created_dataset_is_stored_in_the_database(
    session: AsyncSession,
    dataset: schemas.Dataset,
):
    """Test that a created dataset is stored in the database."""
    stmt = select(models.Dataset).where(models.Dataset.id == dataset.id)
    result = await session.execute(stmt)
    retrieved_dataset = result.unique().scalar_one_or_none()
    assert retrieved_dataset is not None
    assert retrieved_dataset.id == dataset.id
    assert retrieved_dataset.name == dataset.name
    assert retrieved_dataset.description == dataset.description


async def test_dataset_is_stored_with_relative_audio_dir(
    session: AsyncSession,
    audio_dir: Path,
):
    """Test that a dataset is stored with a relative audio dir.""" ""
    dataset_audio_dir = audio_dir / "dataset_audio_dir"
    dataset_audio_dir.mkdir()
    dataset = await api.datasets.create(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        dataset_dir=dataset_audio_dir,
        audio_dir=audio_dir,
    )
    # Make sure the audio dir is stored as a relative path
    stmt = select(models.Dataset).where(models.Dataset.id == dataset.id)
    result = await session.execute(stmt)
    retrieved_dataset = result.unique().scalar_one_or_none()
    assert retrieved_dataset is not None
    assert retrieved_dataset.audio_dir == Path("dataset_audio_dir")


async def test_create_empty_dataset(session: AsyncSession, audio_dir: Path):
    """Test the creation of an empty dataset."""
    dataset_audio_dir = audio_dir / "dataset_audio_dir"
    dataset_audio_dir.mkdir()
    dataset = await api.datasets.create(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        dataset_dir=dataset_audio_dir,
        audio_dir=audio_dir,
    )
    assert isinstance(dataset, schemas.Dataset)
    assert dataset.name == "test_dataset"
    assert dataset.description == "This is a test dataset."


async def test_create_dataset_fails_if_name_is_not_unique(
    session: AsyncSession,
    audio_dir: Path,
):
    """Test that creating a dataset fails if the name is not unique."""
    audio_dir1 = audio_dir / "audio1"
    audio_dir2 = audio_dir / "audio2"
    audio_dir1.mkdir()
    audio_dir2.mkdir()
    await api.datasets.create(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        dataset_dir=audio_dir1,
        audio_dir=audio_dir,
    )
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.datasets.create(
            session,
            name="test_dataset",
            description="This is a test dataset.",
            dataset_dir=audio_dir2,
            audio_dir=audio_dir,
        )


async def test_create_dataset_fails_if_audio_dir_is_not_unique(
    session: AsyncSession,
    audio_dir: Path,
):
    """Test that creating a dataset fails if the audio dir is not unique."""
    dataset_audio_dir = audio_dir / "audio"
    dataset_audio_dir.mkdir()
    await api.datasets.create(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        dataset_dir=dataset_audio_dir,
        audio_dir=audio_dir,
    )
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.datasets.create(
            session,
            name="test_dataset_2",
            description="This is a test dataset.",
            dataset_dir=dataset_audio_dir,
            audio_dir=audio_dir,
        )


async def test_get_dataset_by_uuid(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test getting a dataset by UUID."""
    retrieved_dataset = await api.datasets.get(session, dataset.uuid)
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset.id == dataset.id


async def test_get_dataset_by_uuid_fails_when_uuid_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a dataset by UUID fails when nonexisting."""
    with pytest.raises(exceptions.NotFoundError):
        await api.datasets.get(session, uuid.uuid4())


async def test_get_dataset_by_name(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test getting a dataset by name."""
    retrieved_dataset = await api.datasets.get_by_name(session, dataset.name)
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset.id == dataset.id


async def test_get_dataset_by_name_fails_when_name_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a dataset by name fails when nonexisting."""
    with pytest.raises(exceptions.NotFoundError):
        await api.datasets.get_by_name(
            session,
            name="nonexisting_dataset",
        )


async def test_get_dataset_by_audio_dir(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test getting a dataset by audio directory."""
    retrieved_dataset = await api.datasets.get_by_audio_dir(
        session, dataset.audio_dir
    )
    assert isinstance(retrieved_dataset, schemas.Dataset)
    assert retrieved_dataset.id == dataset.id


async def test_get_dataset_by_audio_dir_fails_when_audio_dir_does_not_exist(
    session: AsyncSession,
    audio_dir: Path,
):
    """Test getting a dataset by audio_dir fails if does not exist."""
    audio_dir = audio_dir / "nonexisting_audio_dir"
    audio_dir.mkdir()
    with pytest.raises(exceptions.NotFoundError):
        await api.datasets.get_by_audio_dir(
            session,
            audio_dir=audio_dir,
        )


async def test_get_datasets(session: AsyncSession, audio_dir: Path):
    """Test getting all datasets."""
    # Arrange
    audio_dir_1 = audio_dir / "audio_1"
    audio_dir_1.mkdir()
    dataset1 = await api.datasets.create(
        session,
        name="test_dataset_1",
        description="This is a test dataset.",
        dataset_dir=audio_dir_1,
        audio_dir=audio_dir,
    )
    audio_dir_2 = audio_dir / "audio_2"
    audio_dir_2.mkdir()
    dataset2 = await api.datasets.create(
        session,
        name="test_dataset_2",
        description="This is a test dataset.",
        dataset_dir=audio_dir_2,
        audio_dir=audio_dir,
    )

    # Act
    retrieved_datasets, _ = await api.datasets.get_many(session)

    # Assert
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 2
    assert dataset1 in retrieved_datasets
    assert dataset2 in retrieved_datasets

    # Act (with limit)
    retrieved_datasets, _ = await api.datasets.get_many(session, limit=1)

    # Assert
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 1
    assert dataset2 in retrieved_datasets

    # Act (with offset)
    retrieved_datasets, _ = await api.datasets.get_many(session, offset=1)
    assert isinstance(retrieved_datasets, list)
    assert len(retrieved_datasets) == 1
    assert dataset1 in retrieved_datasets


async def test_update_dataset_name(
    session: AsyncSession, dataset: schemas.Dataset
):
    """Test updating a dataset's name."""
    assert dataset.name != "updated_dataset"
    updated_dataset = await api.datasets.update(
        session,
        dataset,
        data=schemas.DatasetUpdate(name="updated_dataset"),
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.name == "updated_dataset"


async def test_update_dataset_description(
    session: AsyncSession,
    dataset: schemas.Dataset,
):
    """Test updating a dataset's description."""
    updated_dataset = await api.datasets.update(
        session,
        dataset,
        data=schemas.DatasetUpdate(
            description="This is an updated test dataset."
        ),
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.description == "This is an updated test dataset."


async def test_update_dataset_audio_dir(
    session: AsyncSession, audio_dir: Path, dataset: schemas.Dataset
):
    """Test updating a dataset's audio directory."""
    audio_dir_2 = audio_dir / "audio_2"
    audio_dir_2.mkdir()
    updated_dataset = await api.datasets.update(
        session,
        dataset,
        data=schemas.DatasetUpdate(audio_dir=audio_dir_2),
        audio_dir=audio_dir,
    )
    assert isinstance(updated_dataset, schemas.Dataset)
    assert updated_dataset.audio_dir == Path("audio_2")


async def test_delete_dataset(session: AsyncSession, dataset: schemas.Dataset):
    """Test deleting a dataset."""
    await api.datasets.delete(session, dataset)
    with pytest.raises(exceptions.NotFoundError):
        await api.datasets.get(session, dataset.uuid)


async def test_get_dataset_files(
    session: AsyncSession,
    dataset: schemas.Dataset,
    audio_dir: Path,
):
    """Test getting a dataset's files."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir

    audio_file_1 = dataset_audio_dir / "audio_file_1.wav"
    audio_file_1.touch()
    audio_file_2 = dataset_audio_dir / "audio_file_2.wav"
    audio_file_2.touch()

    # Act
    retrieved_files = await api.datasets.get_state(
        session,
        dataset,
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(retrieved_files, list)
    assert len(retrieved_files) == 2

    assert {audio_file.path for audio_file in retrieved_files} == {
        Path("audio_file_1.wav"),
        Path("audio_file_2.wav"),
    }


async def test_get_dataset_files_with_existing_files(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test getting a dataset's files when some files already exist."""
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path = random_wav_factory(dataset_audio_dir / "audio_file.wav")
    recording = await api.recordings.create(
        session,
        path=path,
        audio_dir=audio_dir,
    )

    await api.datasets.add_recording(
        session,
        dataset,
        recording,
    )

    retrieved_files = await api.datasets.get_state(
        session,
        dataset,
        audio_dir=audio_dir,
    )

    assert len(retrieved_files) == 1
    assert retrieved_files[0].state == schemas.FileState.REGISTERED


async def test_get_dataset_files_with_missing_files(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test getting a dataset's files when some files are missing."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path = random_wav_factory(dataset_audio_dir / "audio_file.wav")

    recording = await api.recordings.create(
        session,
        path=path,
        audio_dir=audio_dir,
    )

    # add the recording to the dataset
    await api.datasets.add_recording(
        session,
        dataset,
        recording,
    )

    # delete the file
    path.unlink()

    # Act
    retrieved_files = await api.datasets.get_state(
        session,
        dataset,
        audio_dir=audio_dir,
    )

    assert isinstance(retrieved_files, list)
    assert len(retrieved_files) == 1
    assert retrieved_files[0].state == schemas.FileState.MISSING


async def test_add_recording_to_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding a recording to a dataset."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    audio_file = random_wav_factory(path=dataset_audio_dir / "audio_file.wav")

    recording = await api.recordings.create(
        session,
        path=audio_file,
        audio_dir=audio_dir,
    )

    # Act
    await api.datasets.add_recording(session, dataset, recording)

    # Assert
    # Make sure the recording was added to the dataset
    query = select(models.DatasetRecording).where(
        models.DatasetRecording.dataset_id == dataset.id,
        models.DatasetRecording.recording_id == recording.id,
    )
    result = await session.execute(query)
    dataset_recording = result.unique().scalar_one_or_none()
    assert dataset_recording is not None


async def test_get_dataset_recordings(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test getting a dataset's recordings."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path_1 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await api.recordings.create(
        session,
        path=path_1,
        audio_dir=audio_dir,
    )

    path_2 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await api.recordings.create(
        session,
        path=path_2,
        audio_dir=audio_dir,
    )

    await api.datasets.add_recording(session, dataset, recording_1)
    await api.datasets.add_recording(session, dataset, recording_2)

    # Act
    retrieved_recordings, _ = await api.datasets.get_recordings(
        session, dataset
    )

    # Assert
    assert isinstance(retrieved_recordings, list)
    assert len(retrieved_recordings) == 2
    assert isinstance(retrieved_recordings[0], schemas.Recording)
    assert isinstance(retrieved_recordings[1], schemas.Recording)
    assert retrieved_recordings[0].path == recording_2.path
    assert retrieved_recordings[1].path == recording_1.path


async def test_add_file_to_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding a file to a dataset."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path = random_wav_factory(
        path=dataset_audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    # Act
    await api.datasets.add_file(
        session,
        dataset,
        path=path,
        audio_dir=audio_dir,
    )

    # Assert
    # Make sure the recording was created
    query = select(models.Recording).where(
        models.Recording.path == str(path.relative_to(audio_dir)),
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None

    # Make sure the recording was added to the dataset
    recording_list, _ = await api.datasets.get_recordings(session, dataset)

    assert len(recording_list) == 1
    assert recording_list[0].path == path.relative_to(audio_dir)


async def test_add_file_to_dataset_fails_if_file_not_in_audio_dir(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding a file to a dataset fails if not in audio dir."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    other_dir = dataset_audio_dir.parent / "other_dir"
    other_dir.mkdir()
    path = random_wav_factory(
        path=other_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    # Act
    with pytest.raises(ValueError):
        await api.datasets.add_file(
            session,
            dataset,
            path=path,
            audio_dir=audio_dir,
        )


async def test_add_file_to_dataset_with_existing_recording(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding a file to a dataset that already exists in the dataset."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path = random_wav_factory(
        path=dataset_audio_dir / "audio_file.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )

    await api.recordings.create(session, path=path, audio_dir=audio_dir)

    # Act
    await api.datasets.add_file(
        session,
        dataset,
        path=path,
        audio_dir=audio_dir,
    )

    # Assert
    recording_list, _ = await api.datasets.get_recordings(session, dataset)

    assert len(recording_list) == 1
    assert recording_list[0].path == path.relative_to(audio_dir)


async def test_add_recordings_to_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding multiple recordings to a dataset."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path_1 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await api.recordings.create(
        session,
        path=path_1,
        audio_dir=audio_dir,
    )

    path_2 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await api.recordings.create(
        session,
        path=path_2,
        audio_dir=audio_dir,
    )

    # Act
    added_paths = await api.datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2],
    )

    # Assert
    assert len(added_paths) == 2
    assert added_paths[0].path == path_1.relative_to(dataset_audio_dir)
    assert added_paths[1].path == path_2.relative_to(dataset_audio_dir)


async def test_add_recordings_to_dataset_ignores_files_not_in_audio_dir(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding recordings to a dataset ignores files not in audio dir."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    other_dir = dataset_audio_dir.parent / "other_dir"
    other_dir.mkdir()

    path_1 = random_wav_factory(path=dataset_audio_dir / "audio_file_1.wav")
    recording_1 = await api.recordings.create(
        session,
        path=path_1,
        audio_dir=audio_dir,
    )

    path_2 = random_wav_factory(path=other_dir / "audio_file_2.wav")
    recording_2 = await api.recordings.create(
        session,
        path=path_2,
        audio_dir=audio_dir,
    )

    # Act
    added_paths = await api.datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2],
    )

    # Assert
    assert len(added_paths) == 1
    assert added_paths[0].path == path_1.relative_to(dataset_audio_dir)


async def test_add_recordings_to_dataset_ignores_duplicate_recordings(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding recordings to a dataset ignores duplicate recordings."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path_1 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await api.recordings.create(
        session,
        path=path_1,
        audio_dir=audio_dir,
    )

    path_2 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await api.recordings.create(
        session,
        path=path_2,
        audio_dir=audio_dir,
    )

    # Act
    added_paths = await api.datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2, recording_1],
    )

    # Assert
    assert len(added_paths) == 2
    assert added_paths[0].path == path_1.relative_to(dataset_audio_dir)
    assert added_paths[1].path == path_2.relative_to(dataset_audio_dir)


async def test_add_recordings_to_dataset_ignores_recordings_already_in_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test adding multiple recordings ignores already in dataset."""
    # Arrange
    dataset_audio_dir = audio_dir / dataset.audio_dir
    path_1 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_1.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_1 = await api.recordings.create(
        session,
        path=path_1,
        audio_dir=audio_dir,
    )

    path_2 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_2.wav",
        duration=1,
        samplerate=8000,
        channels=1,
    )
    recording_2 = await api.recordings.create(
        session,
        path=path_2,
        audio_dir=audio_dir,
    )

    await api.datasets.add_recording(
        session,
        dataset,
        recording_2,
    )

    # Act
    added_paths = await api.datasets.add_recordings(
        session,
        dataset,
        [recording_1, recording_2],
    )

    # Assert
    assert len(added_paths) == 1
    assert added_paths[0].path == path_1.relative_to(dataset_audio_dir)


async def test_create_dataset_registers_all_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating dataset registers all recordings in the directory."""
    dataset_audio_dir = audio_dir / "audio"

    if dataset_audio_dir.exists():
        dataset_audio_dir.rmdir()

    dataset_audio_dir.mkdir()
    audio_file_1 = random_wav_factory(
        path=dataset_audio_dir / "audio_file_1.wav"
    )

    subdirectory = dataset_audio_dir / "subdirectory"
    subdirectory.mkdir()

    audio_file_2 = random_wav_factory(path=subdirectory / "audio_file_2.wav")

    text_file = dataset_audio_dir / "text_file.txt"
    text_file.touch()

    # Act
    dataset = await api.datasets.create(
        session,
        name="test_dataset",
        description="This is a test dataset.",
        dataset_dir=dataset_audio_dir,
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(dataset, schemas.Dataset)
    assert dataset.audio_dir == Path("audio")
    assert dataset.name == "test_dataset"
    assert dataset.description == "This is a test dataset."

    dataset_recordings, _ = await api.datasets.get_recordings(session, dataset)
    assert len(dataset_recordings) == 2
    assert dataset_recordings[0].path == audio_file_2.relative_to(audio_dir)
    assert dataset_recordings[1].path == audio_file_1.relative_to(audio_dir)

    all_recordings, _ = await api.recordings.get_many(session)
    assert len(all_recordings) == 2
