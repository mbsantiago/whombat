"""Test suite for the notes Python API module."""

import datetime
import shutil
from collections.abc import Callable
from pathlib import Path

import pytest
from pydantic import ValidationError
from soundevent.audio import compute_md5_checksum
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_create_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating a recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    hash = compute_md5_checksum(path)

    # Act
    recording = await api.recordings.create(
        session,
        path=path,
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.path == path.relative_to(audio_dir)
    assert recording.time_expansion == 1.0
    assert recording.channels == 1
    assert recording.samplerate == 44100
    assert recording.duration == 1
    assert recording.date is None
    assert recording.time is None
    assert recording.latitude is None
    assert recording.longitude is None
    assert recording.tags == []
    assert recording.notes == []
    assert recording.features == []
    assert recording.hash == hash

    # Make sure it is in the database
    result = await session.execute(select(models.Recording))
    db_recording = result.scalars().first()
    assert db_recording is not None
    assert db_recording.channels == 1
    assert db_recording.samplerate == 44100
    assert db_recording.duration == 1
    assert db_recording.date is None
    assert db_recording.time is None
    assert db_recording.latitude is None
    assert db_recording.longitude is None
    assert db_recording.hash == hash


async def test_create_recording_with_time_expansion(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating a recording with time expansion."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=10,
    )

    # Act
    recording = await api.recordings.create(
        session,
        path=path,
        time_expansion=10.0,
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.time_expansion == 10
    assert recording.duration == 1
    assert recording.samplerate == 441000


async def test_create_recording_fails_if_already_exists(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating a recording fails if it already exists."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    # Act
    await api.recordings.create(
        session,
        path=path,
        audio_dir=audio_dir,
    )

    # Assert
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.recordings.create(
            session,
            path=path,
            audio_dir=audio_dir,
        )


async def test_create_recording_with_date(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating a recording with a date."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    date = datetime.date(2021, 1, 1)

    # Act
    recording = await api.recordings.create(
        session,
        path=path,
        date=date,
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.date == date
    assert recording.time is None
    assert recording.latitude is None
    assert recording.longitude is None


async def test_create_recording_with_time(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating a recording with a time."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    time = datetime.time(12, 0, 0)

    # Act
    recording = await api.recordings.create(
        session,
        path=path,
        time=time,
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.date is None
    assert recording.time == time
    assert recording.latitude is None
    assert recording.longitude is None


async def test_create_recording_with_coordinates(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating a recording with coordinates."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    latitude = 1.0
    longitude = 2.0

    # Act
    recording = await api.recordings.create(
        session,
        path=path,
        latitude=latitude,
        longitude=longitude,
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.date is None
    assert recording.time is None
    assert recording.latitude == latitude
    assert recording.longitude == longitude


async def test_create_recording_fails_if_path_does_not_exist(
    session: AsyncSession,
):
    """Test creating a recording fails if the path does not exist."""
    # Arrange
    path = Path("does_not_exist.wav")

    # Act/Assert
    with pytest.raises(ValidationError):
        await api.recordings.create(
            session,
            path=path,
        )


async def test_create_recording_fails_if_path_is_not_an_audio_file(
    session: AsyncSession,
    audio_dir: Path,
):
    """Test creating a recording fails if the path is not an audio file."""
    # Arrange
    path = audio_dir / "not_an_audio_file.txt"
    path.touch()

    # Act/Assert
    with pytest.raises(ValidationError):
        await api.recordings.create(
            session,
            path=path,
            audio_dir=audio_dir,
        )


async def test_create_recording_with_bad_coordinates_fail(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating a recording with bad coordinates fails."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    latitude = 91.0
    longitude = 2.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await api.recordings.create(
            session,
            path=path,
            latitude=latitude,
            longitude=longitude,
            audio_dir=audio_dir,
        )

    latitude = 1.0
    longitude = 181.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await api.recordings.create(
            session,
            path=path,
            latitude=latitude,
            longitude=longitude,
            audio_dir=audio_dir,
        )


async def test_get_recording_by_hash(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting a recording by its hash."""
    # Act
    retrieved = await api.recordings.get_by_hash(session, recording.hash)

    # Assert
    assert isinstance(retrieved, schemas.Recording)
    assert recording.hash == retrieved.hash


async def test_get_recording_by_hash_fails_if_not_found(
    session: AsyncSession,
):
    """Test getting a recording by its hash fails if not found."""
    # Arrange
    hash = "does_not_exist"

    # Act/Assert
    with pytest.raises(exceptions.NotFoundError):
        await api.recordings.get_by_hash(session, hash)


async def test_update_recording_date(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording's date."""
    # Arrange
    date = datetime.date(2021, 1, 1)
    assert recording.date is None

    # Act
    updated_recording = await api.recordings.update(
        session,
        recording,
        data=schemas.RecordingUpdate(date=date),
    )

    # Assert
    assert updated_recording.date == date
    assert recording.time is None
    assert recording.latitude is None
    assert recording.longitude is None


async def test_update_recording_time(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording's time."""
    # Arrange
    time = datetime.time(12, 0, 0)
    assert recording.time is None

    # Act
    updated_recording = await api.recordings.update(
        session,
        recording,
        data=schemas.RecordingUpdate(time=time),
    )

    # Assert
    assert updated_recording.time == time
    assert recording.date is None
    assert recording.latitude is None
    assert recording.longitude is None


async def test_update_recording_coordinates(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording's coordinates."""
    # Arrange
    latitude = 1.0
    longitude = 2.0
    assert recording.latitude is None
    assert recording.longitude is None

    # Act
    updated_recording = await api.recordings.update(
        session,
        recording,
        data=schemas.RecordingUpdate(
            latitude=latitude,
            longitude=longitude,
        ),
    )

    # Assert
    assert updated_recording.latitude == latitude
    assert updated_recording.longitude == longitude
    assert recording.date is None
    assert recording.time is None


async def test_update_recording_fails_with_bad_coordinates(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording's coordinates fails with bad coordinates."""
    # Arrange
    latitude = 91.0
    longitude = 2.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await api.recordings.update(
            session,
            recording,
            data=schemas.RecordingUpdate(
                latitude=latitude,
                longitude=longitude,
            ),
        )

    latitude = 1.0
    longitude = 181.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await api.recordings.update(
            session,
            recording,
            data=schemas.RecordingUpdate(
                latitude=latitude,
                longitude=longitude,
            ),
        )


async def test_update_recording_time_expansion(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording's time expands the recording."""
    # Act
    updated_recording = await api.recordings.update(
        session,
        recording,
        data=schemas.RecordingUpdate(time_expansion=10),
    )

    # Assert
    assert updated_recording.duration == recording.duration / 10
    assert updated_recording.samplerate == recording.samplerate * 10
    assert updated_recording.time_expansion == 10


async def test_delete_recording(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test deleting a recording."""
    # Act
    await api.recordings.delete(session, recording)

    # Assert
    with pytest.raises(exceptions.NotFoundError):
        await api.recordings.get_by_hash(session, recording.hash)


async def test_add_tag_to_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    """Test adding a tag to a recording."""
    # Act
    recording = await api.recordings.add_tag(session, recording, tag)

    # Assert
    assert tag in recording.tags
    assert isinstance(recording, schemas.Recording)

    # Get the recording again to make sure the tag was added
    recording = await api.recordings.get_by_hash(session, recording.hash)
    assert tag in recording.tags


async def test_add_existing_tag_to_recording_fails(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    """Test adding a tag to a recording is idempotent."""
    recording = await api.recordings.add_tag(session, recording, tag)

    # Act
    with pytest.raises(exceptions.DuplicateObjectError):
        recording = await api.recordings.add_tag(session, recording, tag)


async def test_add_note_to_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    note: schemas.Note,
):
    """Test adding a note to a recording."""
    # Act
    recording = await api.recordings.add_note(session, recording, note)

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert note in recording.notes


async def test_add_existing_note_fails(
    session: AsyncSession,
    recording: schemas.Recording,
    note: schemas.Note,
):
    """Test adding a note to a recording is idempotent."""
    # Arrange
    recording = await api.recordings.add_note(session, recording, note)
    assert len(recording.notes) == 1

    # Act
    with pytest.raises(exceptions.DuplicateObjectError):
        recording = await api.recordings.add_note(session, recording, note)


async def test_add_feature_to_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    feature: schemas.Feature,
):
    """Test adding a feature to a recording."""
    # Act
    recording = await api.recordings.add_feature(
        session,
        recording,
        feature,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert len(recording.features) == 1
    feat = recording.features[0]
    assert feat.name == feature.name
    assert feat.value == feature.value


async def test_add_existing_feature_fails(
    session: AsyncSession,
    recording: schemas.Recording,
    feature: schemas.Feature,
):
    """Test adding a feature to a recording is idempotent."""
    # Arrange
    recording = await api.recordings.add_feature(
        session,
        recording,
        feature,
    )
    assert len(recording.features) == 1

    # Act
    with pytest.raises(exceptions.DuplicateObjectError):
        recording = await api.recordings.add_feature(
            session,
            recording,
            feature,
        )


async def test_remove_note_from_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    note: schemas.Note,
):
    """Test removing a note from a recording."""
    # Arrange
    recording = await api.recordings.add_note(
        session,
        recording,
        note,
    )

    # Act
    recording = await api.recordings.remove_note(
        session,
        recording,
        note,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert note not in recording.notes


async def test_remove_non_existing_note_fails(
    session: AsyncSession,
    note: schemas.Note,
    recording: schemas.Recording,
):
    """Test removing a note from a recording is idempotent."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        recording = await api.recordings.remove_note(
            session,
            recording,
            note,
        )


async def test_remove_tag_from_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    """Test removing a tag from a recording."""
    # Arrange
    recording = await api.recordings.add_tag(
        session,
        recording,
        tag,
    )

    # Make sure the tag was added
    assert tag in recording.tags

    # Act
    recording = await api.recordings.remove_tag(  # noqa: F821
        session,
        recording,
        tag,
    )

    # Assert
    assert tag not in recording.tags


async def test_remove_non_existing_tag_fails(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    with pytest.raises(exceptions.NotFoundError):
        await api.recordings.remove_tag(
            session,
            recording,
            tag,
        )


async def test_remove_feature_from_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    feature: schemas.Feature,
):
    """Test removing a feature from a recording."""
    recording = await api.recordings.add_feature(
        session,
        recording,
        feature,
    )

    # Act
    recording = await api.recordings.remove_feature(
        session, recording, feature
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert len(recording.features) == 0


async def test_remove_non_existing_feature_fails(
    session: AsyncSession,
    recording: schemas.Recording,
    feature: schemas.Feature,
):
    with pytest.raises(exceptions.NotFoundError):
        recording = await api.recordings.remove_feature(
            session,
            recording,
            feature,
        )


async def test_get_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test getting all recordings."""
    # Arrange
    path1 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording1 = await api.recordings.create(
        session,
        path=path1,
        audio_dir=audio_dir,
    )

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await api.recordings.create(
        session,
        path=path2,
        audio_dir=audio_dir,
    )

    # Act
    recording_list, _ = await api.recordings.get_many(session)  # noqa: F821

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording2.hash
    assert isinstance(recording_list[1], schemas.Recording)
    assert recording_list[1].hash == recording1.hash


async def test_get_recordings_with_limit(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test getting all recordings with a limit."""
    # Arrange
    path1 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording1 = await api.recordings.create(
        session,
        path=path1,
        audio_dir=audio_dir,
    )

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await api.recordings.create(
        session,
        path=path2,
        audio_dir=audio_dir,
    )

    # Act
    recording_list, _ = await api.recordings.get_many(session, limit=1)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording2.hash

    # Act
    recording_list, _ = await api.recordings.get_many(session, limit=2)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording2.hash
    assert isinstance(recording_list[1], schemas.Recording)
    assert recording_list[1].hash == recording1.hash


async def test_get_recordings_with_offset(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test getting all recordings with an offset."""
    # Arrange
    path1 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording1 = await api.recordings.create(
        session,
        path=path1,
        audio_dir=audio_dir,
    )

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    await api.recordings.create(
        session,
        path=path2,
        audio_dir=audio_dir,
    )

    # Act
    recording_list, _ = await api.recordings.get_many(session, offset=1)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording1.hash

    # Act
    recording_list, _ = await api.recordings.get_many(session, offset=2)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 0


async def test_get_recording_by_path(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting a recording by path."""
    # Act
    retrieved_recording = await api.recordings.get_by_path(
        session, recording.path
    )

    # Assert
    assert isinstance(retrieved_recording, schemas.Recording)
    assert recording.hash == retrieved_recording.hash
    assert retrieved_recording.path == recording.path


async def test_get_recording_by_path_fails_if_not_found(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test getting a recording by path fails if not found."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await api.recordings.get_by_path(session, path)


async def test_update_recording_path(
    session: AsyncSession,
    recording: schemas.Recording,
    audio_dir: Path,
):
    """Test updating a recording path."""
    # Arrange
    path = audio_dir / recording.path
    new_path = audio_dir / "new_path.wav"
    shutil.move(path, new_path)

    # Act
    recording = await api.recordings.update(
        session,
        recording,
        data=schemas.RecordingUpdate(path=new_path),
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.path == new_path.relative_to(audio_dir)


async def test_update_recording_path_fails_if_no_file_exist(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording path fails if no file exists."""
    # Arrange
    new_path = recording.path.parent / "new_path.wav"

    # Act
    with pytest.raises(ValueError):
        await api.recordings.update(
            session,
            recording,
            data=schemas.RecordingUpdate(path=new_path),
        )


async def test_update_recording_path_fails_if_hash_does_not_coincide(
    session: AsyncSession,
    recording: schemas.Recording,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording path fails if the hash does not coincide."""
    # Arrange
    new_path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    # Act
    with pytest.raises(ValueError):
        await api.recordings.update(
            session,
            recording,
            data=schemas.RecordingUpdate(path=new_path),
        )


async def test_create_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating multiple recordings."""
    # Arrange
    path1 = random_wav_factory()
    path2 = random_wav_factory()

    # Act
    recording_list = await api.recordings.create_many(
        session,
        [dict(path=path1), dict(path=path2)],
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert isinstance(recording_list[1], schemas.Recording)
    assert {recording_list[0].path, recording_list[1].path} == {
        path1.relative_to(audio_dir),
        path2.relative_to(audio_dir),
    }


async def test_create_recordings_ignores_files_already_in_the_dataset(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    recording: schemas.Recording,
    audio_dir: Path,
):
    """Test creating multiple recordings ignores existing ones."""
    # Arrange
    path1 = audio_dir / recording.path
    path2 = random_wav_factory()
    all_recordings, _ = await api.recordings.get_many(session, limit=-1)
    assert len(all_recordings) == 1

    # Act
    recording_list = await api.recordings.create_many(
        session,
        [dict(path=path1), dict(path=path2)],
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording_list, list)
    assert all(isinstance(obj, schemas.Recording) for obj in recording_list)

    all_recordings, _ = await api.recordings.get_many(session, limit=-1)
    assert len(all_recordings) == 2


async def test_create_recordings_removes_hash_duplicates(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating multiple recordings avoids hash duplication.

    Make sure that if two provided files have the same hash, only one is
    registered.
    """
    # Arrange
    path1 = random_wav_factory()
    path2 = path1.parent / "copy.wav"
    shutil.copy(path1, path2)

    # Act
    recording_list = await api.recordings.create_many(
        session,
        [dict(path=path1), dict(path=path2)],
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path1.relative_to(audio_dir)


async def test_create_recording_avoids_hash_duplicates(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating multiple recordings omits pre-registered hashes.

    Make sure that if a hash is already registered in the database, it
    is not registered again.
    """
    # Arrange
    path1 = random_wav_factory()
    path2 = random_wav_factory()

    path3 = path2.parent / "copy.wav"
    shutil.copy(path2, path3)

    # Pre register recording at path3
    await api.recordings.create(
        session,
        path=path3,
        audio_dir=audio_dir,
    )

    # Act
    await api.recordings.create_many(
        session,
        [dict(path=path1), dict(path=path2)],
        audio_dir=audio_dir,
    )

    # Assert
    all_recs, _ = await api.recordings.get_many(session, limit=-1)
    assert len(all_recs) == 2


async def test_create_recordings_with_time_expansion(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
):
    """Test creating multiple recordings with time expansion."""
    # Arrange
    path1 = random_wav_factory(duration=1, samplerate=8000)

    # Act
    recording_list = await api.recordings.create_many(
        session,
        [dict(path=path1, time_expansion=5)],
        audio_dir=audio_dir,
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path1.relative_to(audio_dir)
    assert recording_list[0].time_expansion == 5
    assert recording_list[0].duration == 1 / 5
    assert recording_list[0].samplerate == 8000 * 5
