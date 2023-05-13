"""Test suite for API clip functions."""
import datetime
import shutil
from collections.abc import Callable
from pathlib import Path
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import clips, features, notes, recordings, tags
from whombat.core.files import compute_hash
from whombat.database import models


@pytest.fixture
async def test_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
) -> schemas.Recording:
    """Create a recording for testing."""
    recording = await recordings.create_recording(
        session,
        random_wav_factory(),
    )
    return recording


async def test_create_clip(
    session: AsyncSession,
    test_recording: schemas.Recording,
):
    """Test creating a clip."""
    # Arrange
    query = select(models.Recording).where(
        models.Recording.hash == test_recording.hash,
    )
    db_recording = (await session.execute(query)).scalar_one()

    # Act
    clip = await clips.create_clip(
        session,
        test_recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Assert
    assert clip.start_time == 0.0
    assert clip.end_time == 0.5
    assert clip.recording_id == db_recording.id

    # Make sure the clip was added to the database
    query = select(models.Clip).where(
        models.Clip.uuid == clip.uuid,
    )
    db_clip = (await session.execute(query)).scalar_one()
    assert db_clip.start_time == 0.0
    assert db_clip.end_time == 0.5
    assert db_clip.recording_id == db_recording.id


async def test_create_clip_fails_if_recording_does_exist(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating a clip fails if the recording does not exist."""
    # Arrange
    fake_recording = schemas.Recording.from_file(path=random_wav_factory())

    # Act & Assert
    with pytest.raises(exceptions.NotFoundError):
        await clips.create_clip(
            session,
            fake_recording,
            start_time=0.0,
            end_time=0.5,
        )


async def test_create_clip_fails_for_duplicate_clip(
    session: AsyncSession,
    test_recording: schemas.Recording,
):
    """Test creating a clip fails if the clip already exists."""
    # Arrange
    await clips.create_clip(
        session,
        test_recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act & Assert
    with pytest.raises(exceptions.DuplicateObjectError):
        await clips.create_clip(
            session,
            test_recording,
            start_time=0.0,
            end_time=0.5,
        )
