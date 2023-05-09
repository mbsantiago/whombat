"""Test suite for the notes Python API module."""
import datetime
from collections.abc import Callable
from pathlib import Path
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import notes, recordings, tags, features
from whombat.core.files import compute_hash
from whombat.database import models


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

    hash = compute_hash(path)

    # Act
    recording = await recordings.create_recording(session, path)

    # Assert
    assert isinstance(recording, schemas.Recording)
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
    recording = await recordings.create_recording(session, path, date=date)

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
    recording = await recordings.create_recording(session, path, time=time)

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
        path,
        latitude=latitude,
        longitude=longitude,
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
        await recordings.create_recording(session, path)


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
        await recordings.create_recording(session, path)


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
            path,
            latitude=latitude,
            longitude=longitude,
        )

    latitude = 1.0
    longitude = 181.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await recordings.create_recording(
            session,
            path,
            latitude=latitude,
            longitude=longitude,
        )


async def test_get_recording_by_hash(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test getting a recording by its hash."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    hash = compute_hash(path)
    await recordings.create_recording(session, path)

    # Act
    recording = await recordings.get_recording_by_hash(session, hash)

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.hash == hash


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
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording's date."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    date = datetime.date(2021, 1, 1)
    recording = await recordings.create_recording(session, path)
    assert recording.date is None

    # Act
    updated_recording = await recordings.update_recording(
        session,
        recording,
        date=date,
    )

    # Assert
    assert updated_recording.date == date
    assert recording.time is None
    assert recording.latitude is None
    assert recording.longitude is None


async def test_update_recording_time(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording's time."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    time = datetime.time(12, 0, 0)
    recording = await recordings.create_recording(session, path)
    assert recording.time is None

    # Act
    updated_recording = await recordings.update_recording(
        session,
        recording,
        time=time,
    )

    # Assert
    assert updated_recording.time == time
    assert recording.date is None
    assert recording.latitude is None
    assert recording.longitude is None


async def test_update_recording_coordinates(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording's coordinates."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    latitude = 1.0
    longitude = 2.0
    recording = await recordings.create_recording(session, path)
    assert recording.latitude is None
    assert recording.longitude is None

    # Act
    updated_recording = await recordings.update_recording(
        session,
        recording,
        latitude=latitude,
        longitude=longitude,
    )

    # Assert
    assert updated_recording.latitude == latitude
    assert updated_recording.longitude == longitude
    assert recording.date is None
    assert recording.time is None


async def test_update_recording_fails_with_bad_coordinates(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording's coordinates fails with bad coordinates."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    latitude = 91.0
    longitude = 2.0
    recording = await recordings.create_recording(session, path)

    # Act/Assert
    with pytest.raises(ValidationError):
        await recordings.update_recording(
            session,
            recording,
            latitude=latitude,
            longitude=longitude,
        )

    latitude = 1.0
    longitude = 181.0

    # Act/Assert
    with pytest.raises(ValidationError):
        await recordings.update_recording(
            session,
            recording,
            latitude=latitude,
            longitude=longitude,
        )


async def test_update_recording_nonexistent_succeeds(
    session: AsyncSession,
):
    """Test updating a nonexistent recording succeeds."""
    # Arrange
    recording = schemas.Recording(
        hash="hash",
        duration=1,
        channels=1,
        samplerate=44100,
    )

    # Act
    recording = await recordings.update_recording(
        session,
        recording,
        date=datetime.date(2021, 1, 1),
    )


async def test_delete_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test deleting a recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    # Act
    await recordings.delete_recording(session, recording)

    # Assert
    with pytest.raises(exceptions.NotFoundError):
        await recordings.get_recording_by_hash(session, recording.hash)


async def test_delete_recording_unexistent_succeeds(
    session: AsyncSession,
):
    """Test deleting a nonexistent recording succeeds."""
    # Arrange
    recording = schemas.Recording(
        hash="hash",
        duration=1,
        channels=1,
        samplerate=44100,
    )

    # Act
    await recordings.delete_recording(session, recording)


async def test_add_tag_to_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a tag to a recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)
    tag = await tags.get_or_create_tag(session, key="key", value="value")

    # Act
    recording = await recordings.add_tag_to_recording(
        session,
        tag,
        recording,
    )

    # Assert
    assert tag in recording.tags
    assert isinstance(recording, schemas.Recording)

    # Get the recording again to make sure the tag was added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert tag in recording.tags


async def test_add_tag_to_recording_is_idempotent(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a tag to a recording is idempotent."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)
    tag = await tags.get_or_create_tag(session, key="key", value="value")
    recording = await recordings.add_tag_to_recording(
        session,
        tag,
        recording,
    )
    assert len(recording.tags) == 1

    # Act
    recording = await recordings.add_tag_to_recording(
        session,
        tag,
        recording,
    )

    # Assert
    assert len(recording.tags) == 1



async def test_add_note_to_recording(
    session: AsyncSession,
    user: schemas.User,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a note to a recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    note = await notes.create_note(
        session,
        message="message",
        created_by=user,
    )

    # Act
    recording = await recordings.add_note_to_recording(
        session,
        note,
        recording,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert note in recording.notes

    # Get the recording again to make sure the note was added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert note in recording.notes


async def test_add_note_to_recording_is_idempotent(
    session: AsyncSession,
    user: schemas.User,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a note to a recording is idempotent."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    note = await notes.create_note(
        session,
        message="message",
        created_by=user,
    )

    recording = await recordings.add_note_to_recording(
        session,
        note,
        recording,
    )
    assert len(recording.notes) == 1

    # Act
    recording = await recordings.add_note_to_recording(
        session,
        note,
        recording,
    )

    # Assert
    assert len(recording.notes) == 1


async def test_remove_note_from_recording(
    session: AsyncSession,
    user: schemas.User,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a note from a recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    recording = await recordings.create_recording(session, path)

    note = await notes.create_note(
        session,
        message="message",
        created_by=user,
    )

    recording = await recordings.add_note_to_recording(
        session,
        note,
        recording,
    )

    # Act
    recording = await recordings.remove_note_from_recording(
        session,
        note,
        recording,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert note not in recording.notes

    # Get the recording again to make sure the note was removed
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert note not in recording.notes


async def test_remove_note_from_recording_fails_if_recording_does_not_exist(
    session: AsyncSession,
    user: schemas.User,
):
    """Test removing a note from a recording fails if the recording does not exist."""
    # Arrange
    recording = schemas.Recording(
        hash="hash",
        duration=1,
        channels=1,
        samplerate=44100,
    )

    note = await notes.create_note(
        session,
        message="message",
        created_by=user,
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_note_from_recording(
            session,
            note,
            recording,
        )


async def test_remove_note_from_recording_fails_if_note_does_not_exist(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a note from a recording fails if the note does not exist."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    recording = await recordings.create_recording(session, path)

    note = schemas.Note(
        uuid=uuid4(),
        message="message",
        created_by="username",
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_note_from_recording(
            session,
            note,
            recording,
        )


async def test_remove_note_from_recording_is_idempotent(
    session: AsyncSession,
    user: schemas.User,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a note from a recording is idempotent."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    recording = await recordings.create_recording(session, path)

    note = await notes.create_note(
        session,
        message="message",
        created_by=user,
    )

    recording = await recordings.add_note_to_recording(
        session,
        note,
        recording,
    )
    assert len(recording.notes) == 1

    # Act
    recording = await recordings.remove_note_from_recording(
        session,
        note,
        recording,
    )

    # Assert
    assert len(recording.notes) == 0

    # Act
    recording = await recordings.remove_note_from_recording(
        session,
        note,
        recording,
    )

    # Assert
    assert len(recording.notes) == 0


async def test_add_feature_to_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a feature to a recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    feature = await features.create_feature(
        session,
        name="name",
        value=10,
    )

    # Act
    recording = await recordings.add_feature_to_recording(
        session,
        feature,
        recording,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert feature in recording.features

    # Get the recording again to make sure the feature was added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert feature in recording.features


async def test_add_feature_to_recording_is_idempotent(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a feature to a recording is idempotent."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    feature = await features.create_feature(
        session,
        name="name",
        value=10,
    )

    recording = await recordings.add_feature_to_recording(
        session,
        feature,
        recording,
    )
    assert len(recording.features) == 1

    # Act
    recording = await recordings.add_feature_to_recording(
        session,
        feature,
        recording,
    )

    # Assert
    assert len(recording.features) == 1

    # Get the recording again to make sure no features were added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert len(recording.features) == 1
