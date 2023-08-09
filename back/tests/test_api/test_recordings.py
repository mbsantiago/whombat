"""Test suite for the notes Python API module."""
import datetime
import shutil
from collections.abc import Callable
from pathlib import Path
from uuid import uuid4

import pytest
from pydantic import ValidationError
from soundevent.audio import compute_md5_checksum
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import features, notes, recordings, tags
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

    hash = compute_md5_checksum(path)

    # Act
    recording = await recordings.create_recording(session, path)

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
        path,
        time_expansion=10.0,
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
    await recordings.create_recording(session, path)

    # Assert
    with pytest.raises(exceptions.DuplicateObjectError):
        await recordings.create_recording(session, path)


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
    hash = compute_md5_checksum(path)
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


async def test_update_recording_time_expansion(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording's time expands the recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=10,
    )
    recording = await recordings.create_recording(session, path)

    # Act
    updated_recording = await recordings.update_recording(
        session,
        recording,
        time_expansion=10,
    )

    # Assert
    assert updated_recording.duration == 1
    assert updated_recording.samplerate == 441000
    assert updated_recording.time_expansion == 10


async def test_update_recording_nonexistent_succeeds(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test updating a nonexistent recording succeeds."""
    # Arrange
    path = tmp_path / "path.wav"
    path.touch()
    recording = schemas.Recording(
        path=path,
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
    tmp_path: Path,
):
    """Test deleting a nonexistent recording succeeds."""
    # Arrange
    path = tmp_path / "path.wav"
    path.touch()
    recording = schemas.Recording(
        path=path,
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


async def test_add_tag_to_recording_creates_tag_if_not_exists(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a tag to a recording creates the tag if it doesn't exist."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)
    tag = schemas.Tag(key="key", value="value")

    # Act
    recording = await recordings.add_tag_to_recording(
        session,
        tag,
        recording,
    )

    # Assert
    assert tag in recording.tags
    assert isinstance(recording, schemas.Recording)

    # make sure the tag was created
    query = select(models.Tag).where(
        models.Tag.key == tag.key,
        models.Tag.value == tag.value,
    )
    result = await session.execute(query)
    assert result.scalars().first()


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


async def test_add_feature_to_recording_creates_feature_name_if_not_exist(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test adding recording features creates feature name if nonexistent."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    feature = schemas.Feature(
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

    # Make sure the feature name was created
    query = select(models.FeatureName).where(
        models.FeatureName.name == feature.name,
    )
    result = await session.execute(query)
    assert result.scalars().first()


async def test_add_note_to_recording_creates_note_if_it_doesnt_exist(
    session: AsyncSession,
    user: schemas.User,
    random_wav_factory: Callable[..., Path],
):
    """Test adding a recording note creates the note if it doesn't exist."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    # Act
    recording = await recordings.add_note_to_recording(
        session,
        schemas.Note(
            message="message",
            created_by=user.username,
        ),
        recording,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert len(recording.notes) == 1

    # Make sure the note was created
    query = select(models.Note).where(models.Note.message == "message")
    result = await session.execute(query)
    note = result.scalars().first()
    assert note is not None


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
    tmp_path: Path,
):
    """Test removing a recording note fails if the recording does not exist."""
    # Arrange
    path = tmp_path / "path.wav"
    path.touch()
    recording = schemas.Recording(
        path=path,
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
    """Test removing a recording note fails if the note does not exist."""
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


async def test_remove_tag_from_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a tag from a recording."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    recording = await recordings.create_recording(session, path)

    tag = await tags.create_tag(
        session,
        key="name",
        value="value",
    )

    recording = await recordings.add_tag_to_recording(
        session,
        tag,
        recording,
    )

    # Make sure the tag was added
    assert tag in recording.tags

    # Act
    recording = await recordings.remove_tag_from_recording(
        session,
        tag,
        recording,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert tag not in recording.tags

    # Get the recording again to make sure the tag was removed
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert tag not in recording.tags


async def test_remove_tag_from_recording_fails_with_nonexistent_recording(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test removing a recording tag fails with a nonexistent recording."""
    # Arrange
    path = tmp_path / "path.wav"
    path.touch()
    recording = schemas.Recording(
        path=path,
        hash="hash",
        duration=1,
        channels=1,
        samplerate=44100,
    )

    tag = await tags.create_tag(
        session,
        key="name",
        value="value",
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_tag_from_recording(
            session,
            tag,
            recording,
        )


async def test_remove_tag_from_recording_fails_with_nonexistent_tag(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a tag from a recording fails with a nonexistent tag."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    recording = await recordings.create_recording(session, path)

    tag = schemas.Tag(
        key="name",
        value="value",
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_tag_from_recording(
            session,
            tag,
            recording,
        )


async def test_remove_tag_from_recording_is_idempotent(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a tag from a recording is idempotent."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    recording = await recordings.create_recording(session, path)

    tag = await tags.create_tag(
        session,
        key="name",
        value="value",
    )

    recording = await recordings.add_tag_to_recording(
        session,
        tag,
        recording,
    )
    assert len(recording.tags) == 1

    # Act
    recording = await recordings.remove_tag_from_recording(
        session,
        tag,
        recording,
    )

    # Assert
    assert len(recording.tags) == 0

    # Act
    recording = await recordings.remove_tag_from_recording(
        session,
        tag,
        recording,
    )

    # Assert
    assert len(recording.tags) == 0


async def test_remove_feature_from_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a feature from a recording."""
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

    # Make sure the feature was added
    assert feature in recording.features

    # Act
    recording = await recordings.remove_feature_from_recording(
        session,
        feature,
        recording,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert feature not in recording.features

    # Get the recording again to make sure the feature was removed
    recording = await recordings.get_recording_by_hash(session, recording.hash)
    assert feature not in recording.features


async def test_remove_feature_from_recording_fails_with_nonexistent_recording(
    session: AsyncSession,
    tmp_path: Path,
):
    """Test removing a recording feature fails with a nonexistent recording."""
    # Arrange
    path = tmp_path / "path.wav"
    path.touch()
    recording = schemas.Recording(
        path=path,
        hash="hash",
        duration=1,
        channels=1,
        samplerate=44100,
    )

    feature = await features.create_feature(
        session,
        name="name",
        value=10,
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_feature_from_recording(
            session,
            feature,
            recording,
        )


async def test_remove_feature_from_recording_fails_with_nonexistent_feature(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a recording feature fails with a nonexistent feature."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    recording = await recordings.create_recording(session, path)

    feature = schemas.Feature(
        name="name",
        value=10,
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.remove_feature_from_recording(
            session,
            feature,
            recording,
        )


async def test_remove_feature_from_recording_is_idempotent(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test removing a feature from a recording is idempotent."""
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
    recording = await recordings.remove_feature_from_recording(
        session,
        feature,
        recording,
    )

    # Assert
    assert len(recording.features) == 0

    # Act
    recording = await recordings.remove_feature_from_recording(
        session,
        feature,
        recording,
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
    recording1 = await recordings.create_recording(session, path1)

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await recordings.create_recording(session, path2)

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
    recording1 = await recordings.create_recording(session, path1)

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await recordings.create_recording(session, path2)

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
    await recordings.create_recording(session, path1)

    path2 = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording2 = await recordings.create_recording(session, path2)

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
    random_wav_factory: Callable[..., Path],
):
    """Test getting a recording by path."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    created_recording = await recordings.create_recording(session, path)

    # Act
    retrieved_recording = await recordings.get_recording_by_path(session, path)

    # Assert
    assert isinstance(retrieved_recording, schemas.Recording)
    assert retrieved_recording.path == path
    assert created_recording.hash == retrieved_recording.hash


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
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording path."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    new_path = path.parent / "new_path.wav"
    shutil.move(path, new_path)

    # Act
    recording = await recordings.update_recording_path(
        session,
        recording,
        new_path,
    )

    # Assert
    assert isinstance(recording, schemas.Recording)
    assert recording.path == new_path


async def test_update_recording_path_fails_if_no_file_exist(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording path fails if no file exists."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    new_path = path.parent / "new_path.wav"

    # Act
    with pytest.raises(ValueError):
        await recordings.update_recording_path(
            session,
            recording,
            new_path,
        )


async def test_update_recording_path_fails_if_hash_does_not_coincide(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording path fails if the hash does not coincide."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )
    recording = await recordings.create_recording(session, path)

    new_path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    # Act
    with pytest.raises(ValueError):
        await recordings.update_recording_path(
            session,
            recording,
            new_path,
        )


async def test_update_recording_fails_if_recording_does_not_exist(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test updating a recording fails if the recording does not exist."""
    # Arrange
    path = random_wav_factory(
        channels=1,
        samplerate=44100,
        duration=1,
    )

    hash = compute_md5_checksum(path)

    recording = schemas.Recording(
        hash=hash,
        path=path,
        duration=1,
        samplerate=44100,
        channels=1,
    )

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await recordings.update_recording_path(
            session,
            recording,
            path,
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
        [path1, path2],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert isinstance(recording_list[1], schemas.Recording)
    assert recording_list[0].path == path1
    assert recording_list[1].path == path2


async def test_create_recordings_ignores_non_existing_files(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating multiple recordings ignores non-existing files."""
    # Arrange
    path1 = random_wav_factory()
    path2 = Path("non_existing_file.wav")

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [path1, path2],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path1


async def test_create_recordings_ignores_non_audio_files(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    tmp_path: Path,
):
    """Test creating multiple recordings ignores non-audio files."""
    # Arrange
    path1 = random_wav_factory()
    path2 = tmp_path / "non_audio_file.txt"
    path2.touch()

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [path1, path2],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path1


async def test_create_recordings_ignores_files_already_in_the_dataset(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating multiple recordings ignores existing ones."""
    # Arrange
    path1 = random_wav_factory()
    path2 = random_wav_factory()

    await recordings.create_recording(session, path1)

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [path1, path2],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path2


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
        [path1, path2],
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
    await recordings.create_recording(session, path3)

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [path1, path2],
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 1
    assert isinstance(recording_list[0], schemas.Recording)
    assert recording_list[0].path == path1


async def test_create_recordings_with_time_expansion(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating multiple recordings with time expansion."""
    # Arrange
    path1 = random_wav_factory(duration=1, samplerate=8000)
    path2 = random_wav_factory(duration=2, samplerate=16000)

    # Act
    recording_list = await recordings.create_recordings(
        session,
        [path1, path2],
        time_expansion=5,
    )

    # Assert
    assert isinstance(recording_list, list)
    assert len(recording_list) == 2
    assert isinstance(recording_list[0], schemas.Recording)
    assert isinstance(recording_list[1], schemas.Recording)
    assert recording_list[0].path == path1
    assert recording_list[1].path == path2
    assert recording_list[0].time_expansion == 5
    assert recording_list[1].time_expansion == 5
    assert recording_list[0].duration == 1 / 5
    assert recording_list[1].duration == 2 / 5
    assert recording_list[0].samplerate == 8000 * 5
    assert recording_list[1].samplerate == 16000 * 5
