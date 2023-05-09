"""Test suite for recording filters."""
from pathlib import Path
from typing import Callable

from sqlalchemy.ext.asyncio import AsyncSession

import whombat.filters.recordings as filters
from whombat import schemas
from whombat.api import notes, recordings


async def test_duration_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the duration filter."""
    # Arrange
    path1 = random_wav_factory(duration=0.1)
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
    )

    path2 = random_wav_factory(duration=0.2)
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.DurationFilter(gt=0.15)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.DurationFilter(lt=0.15)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash


async def test_samplerate_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the samplerate filter."""
    # Arrange
    path1 = random_wav_factory(samplerate=22050)
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
    )

    path2 = random_wav_factory(samplerate=44100)
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.SamplerateFilter(gt=30_000)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.SamplerateFilter(lt=30_000)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.SamplerateFilter(eq=22050)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash


async def test_channels_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the channels filter."""
    # Arrange
    path1 = random_wav_factory(channels=1)
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
    )

    path2 = random_wav_factory(channels=3)
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.ChannelsFilter(gt=2)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.ChannelsFilter(lt=2)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.ChannelsFilter(eq=1)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash


async def test_issues_filter(
    session: AsyncSession,
    user: schemas.User,
    random_wav_factory: Callable[..., Path],
):
    """Test the issues filter."""
    # Arrange
    path1 = random_wav_factory()
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
    )

    path2 = random_wav_factory()
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
    )

    note = await notes.create_note(
        session=session,
        message="note",
        created_by=user,
        is_issue=True,
    )

    await recordings.add_note_to_recording(
        session=session,
        note=note,
        recording=recording1,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.IssuesFilter(has_issues=True)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.IssuesFilter(has_issues=False)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash
