"""Test suite for the notes Python API module."""
import datetime
from collections.abc import Callable
from pathlib import Path

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import notes, recordings, tags
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

    # Act
    recording, tag = await recordings.add_tag_to_recording(
        session,
        recording,
        key="key",
        value="value",
    )

    # Assert
    assert tag in recording.tags
    assert isinstance(tag, schemas.Tag)
    assert isinstance(recording, schemas.Recording)
    assert tag.key == "key"
    assert tag.value == "value"

    # Get the recording again to make sure the tag was added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert tag in recording.tags


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

    # Act
    recording, note = await recordings.add_note_to_recording(
        session,
        recording,
        message="message",
        created_by=user,
    )

    # Assert
    assert isinstance(note, schemas.Note)
    assert isinstance(recording, schemas.Recording)
    assert note in recording.notes

    # Get the recording again to make sure the note was added
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert note in recording.notes
