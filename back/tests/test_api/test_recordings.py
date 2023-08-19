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

from whombat import exceptions, models, schemas
from whombat.api import recordings


async def test_create_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
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
    recording = await recordings.create_recording(
        session, data=schemas.RecordingCreate(path=path)
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.path == path.absolute()
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
):
    """Test creating a recording with time expansion."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=10,
    )

    # Act
    recording = await recordings.create_recording(
        session,
        data=schemas.RecordingCreate(path=path, time_expansion=10.0),
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.time_expansion == 10
    assert recording.duration == 1
    assert recording.samplerate == 441000


async def test_create_recording_fails_if_already_exists(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating a recording fails if it already exists."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    # Act
    await recordings.create_recording(
        session, data=schemas.RecordingCreate(path=path)
    )

    # Assert
    with pytest.raises(exceptions.DuplicateObjectError):
        await recordings.create_recording(
            session, data=schemas.RecordingCreate(path=path)
        )


async def test_create_recording_with_date(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
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
    recording = await recordings.create_recording(
        session, data=schemas.RecordingCreate(path=path, date=date)
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
    recording = await recordings.create_recording(
        session, data=schemas.RecordingCreate(path=path, time=time)
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
    recording = await recordings.create_recording(
        session,
        data=schemas.RecordingCreate(
            path=path,
            latitude=latitude,
            longitude=longitude,
        ),
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
        await recordings.create_recording(
            session, schemas.RecordingCreate(path=path)
        )


async def test_create_recording_fails_if_path_is_not_an_audio_file(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test creating a recording fails if the path is not an audio file."""
    # Arrange
    path = tmp_path / "not_an_audio_file.txt"
    path.touch()

    # Act/Assert
    with pytest.raises(ValidationError):
        await recordings.create_recording(
            session, schemas.RecordingCreate(path=path)
        )


async def test_create_recording_with_bad_coordinates_fail(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
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
        await recordings.create_recording(
            session,
            data=schemas.RecordingCreate(
                path=path,
                latitude=latitude,
                longitude=longitude,
            ),
        )

    latitude = 1.0
    longitude = 181.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await recordings.create_recording(
            session,
            data=schemas.RecordingCreate(
                path=path,
                latitude=latitude,
                longitude=longitude,
            ),
        )


async def test_get_recording_by_hash(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting a recording by its hash."""
    # Act
    retrieved = await recordings.get_recording_by_hash(session, recording.hash)

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
        await recordings.get_recording_by_hash(session, hash)


async def test_update_recording_date(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording's date."""
    # Arrange
    date = datetime.date(2021, 1, 1)
    assert recording.date is None

    # Act
    updated_recording = await recordings.update_recording(
        session,
        recording_id=recording.id,
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
    updated_recording = await recordings.update_recording(
        session,
        recording_id=recording.id,
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
    updated_recording = await recordings.update_recording(
        session,
        recording_id=recording.id,
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
        await recordings.update_recording(
            session,
            recording_id=recording.id,
            data=schemas.RecordingUpdate(
                latitude=latitude,
                longitude=longitude,
            ),
        )

    latitude = 1.0
    longitude = 181.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await recordings.update_recording(
            session,
            recording_id=recording.id,
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
    updated_recording = await recordings.update_recording(
        session,
        recording_id=recording.id,
        data=schemas.RecordingUpdate(time_expansion=10),
    )

    # Assert
    assert updated_recording.duration == recording.duration / 10
    assert updated_recording.samplerate == recording.samplerate * 10
    assert updated_recording.time_expansion == 10


async def test_update_nonexisting_recording_fails(
    session: AsyncSession,
):
    """Test updating a nonexistent recording succeeds."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.update_recording(
            session,
            recording_id=2,
            data=schemas.RecordingUpdate(
                date=datetime.date(2021, 1, 1),
            ),
        )


async def test_delete_recording(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test deleting a recording."""
    # Arrange

    # Act
    await recordings.delete_recording(session, recording_id=recording.id)

    # Assert
    with pytest.raises(exceptions.NotFoundError):
        await recordings.get_recording_by_hash(session, recording.hash)


async def test_delete_non_existing_recording_fails(
    session: AsyncSession,
):
    """Test deleting a nonexistent recording succeeds."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.delete_recording(session, recording_id=2)


async def test_add_tag_to_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    """Test adding a tag to a recording."""
    # Act
    recording = await recordings.add_tag_to_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )

    # Assert
    assert tag in recording.tags
    assert isinstance(recording, schemas.Recording)

    # Get the recording again to make sure the tag was added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert tag in recording.tags


async def test_add_tag_to_recording_is_idempotent(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    """Test adding a tag to a recording is idempotent."""
    recording = await recordings.add_tag_to_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )
    assert len(recording.tags) == 1

    # Act
    recording = await recordings.add_tag_to_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )

    # Assert
    assert len(recording.tags) == 1


async def test_add_note_to_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    note: schemas.Note,
):
    """Test adding a note to a recording."""
    # Act
    recording = await recordings.add_note_to_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert note in recording.notes


async def test_add_note_to_recording_is_idempotent(
    session: AsyncSession,
    recording: schemas.Recording,
    note: schemas.Note,
):
    """Test adding a note to a recording is idempotent."""
    # Arrange
    recording = await recordings.add_note_to_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )
    assert len(recording.notes) == 1

    # Act
    recording = await recordings.add_note_to_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )

    # Assert
    assert len(recording.notes) == 1


async def test_add_feature_to_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    feature_name: schemas.FeatureName,
):
    """Test adding a feature to a recording."""
    # Act
    value = 10
    recording = await recordings.add_feature_to_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature_name.id,
        value=value,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert len(recording.features) == 1
    feat = recording.features[0]
    assert feat.feature_name == feature_name
    assert feat.value == value


async def test_add_feature_to_recording_is_idempotent(
    session: AsyncSession,
    recording: schemas.Recording,
    feature_name: schemas.FeatureName,
):
    """Test adding a feature to a recording is idempotent."""
    # Arrange
    value = 10
    recording = await recordings.add_feature_to_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature_name.id,
        value=value,
    )
    assert len(recording.features) == 1

    # Act
    recording = await recordings.add_feature_to_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature_name.id,
        value=value,
    )

    # Assert
    assert len(recording.features) == 1

    # Get the recording again to make sure no features were added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert len(recording.features) == 1


async def test_remove_note_from_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    note: schemas.Note,
):
    """Test removing a note from a recording."""
    # Arrange
    recording = await recordings.add_note_to_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )

    # Act
    recording = await recordings.remove_note_from_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert note not in recording.notes

    # Get the recording again to make sure the note was removed
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert note not in recording.notes


async def test_remove_note_from_recording_fails_if_recording_does_not_exist(
    session: AsyncSession,
    note: schemas.Note,
):
    """Test removing a recording note fails if the recording does not exist."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_note_from_recording(
            session,
            recording_id=3,
            note_id=note.id,
        )


async def test_remove_note_from_recording_fails_if_note_does_not_exist(
    session: AsyncSession,
):
    """Test removing a recording note fails if the note does not exist."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_note_from_recording(
            session,
            recording_id=3,
            note_id=3,
        )


async def test_remove_note_from_recording_is_idempotent(
    session: AsyncSession,
    note: schemas.Note,
    recording: schemas.Recording,
):
    """Test removing a note from a recording is idempotent."""
    # Arrange
    recording = await recordings.add_note_to_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )
    assert len(recording.notes) == 1

    # Act
    recording = await recordings.remove_note_from_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )

    # Assert
    assert len(recording.notes) == 0

    # Act
    recording = await recordings.remove_note_from_recording(
        session,
        recording_id=recording.id,
        note_id=note.id,
    )

    # Assert
    assert len(recording.notes) == 0


async def test_remove_tag_from_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    """Test removing a tag from a recording."""
    # Arrange
    recording = await recordings.add_tag_to_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )

    # Make sure the tag was added
    assert tag in recording.tags

    # Act
    recording = await recordings.remove_tag_from_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert tag not in recording.tags

    # Get the recording again to make sure the tag was removed
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert tag not in recording.tags


async def test_remove_tag_from_recording_fails_with_nonexistent_recording(
    session: AsyncSession,
):
    """Test removing a recording tag fails with a nonexistent recording."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_tag_from_recording(
            session,
            recording_id=3,
            tag_id=3,
        )


async def test_remove_tag_from_recording_is_idempotent(
    session: AsyncSession,
    recording: schemas.Recording,
    tag: schemas.Tag,
):
    """Test removing a tag from a recording is idempotent."""
    # Arrange
    recording = await recordings.add_tag_to_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )
    assert len(recording.tags) == 1

    # Act
    recording = await recordings.remove_tag_from_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )

    # Assert
    assert len(recording.tags) == 0

    # Act
    recording = await recordings.remove_tag_from_recording(
        session,
        recording_id=recording.id,
        tag_id=tag.id,
    )

    # Assert
    assert len(recording.tags) == 0


async def test_remove_feature_from_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    feature_name: schemas.FeatureName,
):
    """Test removing a feature from a recording."""
    value = 10
    recording = await recordings.add_feature_to_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature_name.id,
        value=value,
    )

    # Act
    recording = await recordings.remove_feature_from_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature_name.id,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert len(recording.features) == 0


async def test_remove_feature_from_recording_fails_with_nonexistent_recording(
    session: AsyncSession,
):
    """Test removing a recording feature fails with a nonexistent recording."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_feature_from_recording(
            session,
            recording_id=3,
            feature_name_id=3,
        )


async def test_remove_feature_from_recording_is_idempotent(
    session: AsyncSession,
    recording: schemas.Recording,
    feature_name: schemas.FeatureName,
):
    """Test removing a feature from a recording is idempotent."""
    feature = schemas.Feature(feature_name=feature_name, value=1.0)
    recording = await recordings.add_feature_to_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature_name.id,
        value=feature.value,
    )
    assert len(recording.features) == 1

    # Act
    recording = await recordings.remove_feature_from_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature.feature_name.id,
    )

    # Assert
    assert len(recording.features) == 0

    # Act
    recording = await recordings.remove_feature_from_recording(
        session,
        recording_id=recording.id,
        feature_name_id=feature.feature_name.id,
    )

    # Assert
    assert len(recording.features) == 0


async def test_get_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test getting all recordings."""
    # Arrange
    path1 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording1 = await recordings.create_recording(
        session, schemas.RecordingCreate(path=path1)
    )

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await recordings.create_recording(
        session, schemas.RecordingCreate(path=path2)
    )

    # Act
    recording_list = await recordings.get_recordings(session)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording1.hash
    assert isinstance(recording_list[1], schemas.Recording)
    assert recording_list[1].hash == recording2.hash


async def test_get_recordings_with_limit(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test getting all recordings with a limit."""
    # Arrange
    path1 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording1 = await recordings.create_recording(
        session, schemas.RecordingCreate(path=path1)
    )

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await recordings.create_recording(
        session, schemas.RecordingCreate(path=path2)
    )

    # Act
    recording_list = await recordings.get_recordings(session, limit=1)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording1.hash

    # Act
    recording_list = await recordings.get_recordings(session, limit=2)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording1.hash
    assert isinstance(recording_list[1], schemas.Recording)
    assert recording_list[1].hash == recording2.hash


async def test_get_recordings_with_offset(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test getting all recordings with an offset."""
    # Arrange
    path1 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    await recordings.create_recording(
        session, schemas.RecordingCreate(path=path1)
    )

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await recordings.create_recording(
        session, schemas.RecordingCreate(path=path2)
    )

    # Act
    recording_list = await recordings.get_recordings(session, offset=1)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].hash == recording2.hash

    # Act
    recording_list = await recordings.get_recordings(session, offset=2)

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 0


async def test_get_recording_by_path(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting a recording by path."""
    # Act
    retrieved_recording = await recordings.get_recording_by_path(
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
        await recordings.get_recording_by_path(session, path)


async def test_update_recording_path(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording path."""
    # Arrange
    path = recording.path
    new_path = path.parent / "new_path.wav"
    shutil.move(path, new_path)

    # Act
    recording = await recordings.update_recording(
        session,
        recording_id=recording.id,
        data=schemas.RecordingUpdate(path=new_path),
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.path == new_path


async def test_update_recording_path_fails_if_no_file_exist(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a recording path fails if no file exists."""
    # Arrange
    new_path = recording.path.parent / "new_path.wav"

    # Act
    with pytest.raises(ValueError):
        await recordings.update_recording(
            session,
            recording_id=recording.id,
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
        await recordings.update_recording(
            session,
            recording_id=recording.id,
            data=schemas.RecordingUpdate(path=new_path),
        )


async def test_update_recording_fails_if_recording_does_not_exist(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test updating a recording fails if the recording does not exist."""
    # Act
    with pytest.raises(ValidationError):
        await recordings.update_recording(
            session,
            recording_id=3,
            data=schemas.RecordingUpdate(path=tmp_path / "test.wav"),
        )


async def test_create_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating multiple recordings."""
    # Arrange
    path1 = random_wav_factory()
    path2 = random_wav_factory()

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [
            schemas.RecordingCreate(path=path1),
            schemas.RecordingCreate(path=path2),
        ],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert isinstance(recording_list[1], schemas.Recording)
    assert {recording_list[0].path, recording_list[1].path} == {path1, path2}


async def test_create_recordings_ignores_files_already_in_the_dataset(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    recording: schemas.Recording,
):
    """Test creating multiple recordings ignores existing ones."""
    # Arrange
    path1 = recording.path
    path2 = random_wav_factory()
    all_recordings = await recordings.get_recordings(session, limit=-1)
    assert len(all_recordings) == 1

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [
            schemas.RecordingCreate(path=path1),
            schemas.RecordingCreate(path=path2),
        ],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert all(isinstance(obj, schemas.Recording) for obj in recording_list)

    all_recordings = await recordings.get_recordings(session, limit=-1)
    assert len(all_recordings) == 2


async def test_create_recordings_removes_hash_duplicates(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating multiple recordings avoids hash duplication.

    Make sure that if two provided files have the same hash, only one
    is registered.
    """
    # Arrange
    path1 = random_wav_factory()
    path2 = path1.parent / "copy.wav"
    shutil.copy(path1, path2)

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [
            schemas.RecordingCreate(path=path1),
            schemas.RecordingCreate(path=path2),
        ],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path1


async def test_create_recording_avoids_hash_duplicates(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating multiple recordings omits pre-registered hashes.

    Make sure that if a hash is already registered in the database, it is not
    registered again.
    """
    # Arrange
    path1 = random_wav_factory()
    path2 = random_wav_factory()

    path3 = path2.parent / "copy.wav"
    shutil.copy(path2, path3)

    # Pre register recording at path3
    await recordings.create_recording(
        session, schemas.RecordingCreate(path=path3)
    )

    # Act
    await recordings.create_recordings(
        session,
        [
            schemas.RecordingCreate(path=path1),
            schemas.RecordingCreate(path=path2),
        ],
    )

    # Assert
    all_recs = await recordings.get_recordings(session, limit=-1)
    assert len(all_recs) == 2


async def test_create_recordings_with_time_expansion(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating multiple recordings with time expansion."""
    # Arrange
    path1 = random_wav_factory(duration=1, samplerate=8000)

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [
            schemas.RecordingCreate(path=path1, time_expansion=5),
        ],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path1
    assert recording_list[0].time_expansion == 5
    assert recording_list[0].duration == 1 / 5
    assert recording_list[0].samplerate == 8000 * 5
