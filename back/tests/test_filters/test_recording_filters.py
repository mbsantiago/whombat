"""Test suite for recording filters."""
import datetime
from pathlib import Path
from typing import Callable

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, filters, schemas


@pytest.fixture
async def create_test_recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Create a recording for testing."""

    async def factory(
        duration: float = 0.1,
        samplerate: int = 8_000,
        channels: int = 1,
        **kwargs,
    ) -> schemas.Recording:
        path = random_wav_factory(
            duration=duration,
            samplerate=samplerate,
            channels=channels,
        )
        return await api.recordings.create_recording(
            session=session,
            data=schemas.RecordingCreate(path=path, **kwargs),
        )

    return factory


async def test_duration_filter(
    session: AsyncSession,
    create_test_recording,
):
    """Test the duration filter."""
    # Arrange
    recording_list = [
        await create_test_recording(duration=0.1),
        await create_test_recording(duration=0.2),
    ]

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.DurationFilter(ge=0.15)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.DurationFilter(le=0.15)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[0].hash


async def test_samplerate_filter(
    session: AsyncSession,
    create_test_recording,
):
    """Test the samplerate filter."""
    # Arrange
    recording_list = [
        await create_test_recording(samplerate=8_000),
        await create_test_recording(samplerate=12_000),
        await create_test_recording(samplerate=16_000),
    ]

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.SamplerateFilter(ge=12_000)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording_list[1].hash
    assert results[1].hash == recording_list[2].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.SamplerateFilter(le=12_000)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording_list[0].hash
    assert results[1].hash == recording_list[1].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.SamplerateFilter(eq=12_000)],
    )
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash


async def test_channels_filter(
    session: AsyncSession,
    create_test_recording,
):
    """Test the channels filter."""
    # Arrange
    recording_list = [
        await create_test_recording(channels=1),
        await create_test_recording(channels=2),
        await create_test_recording(channels=3),
    ]

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.ChannelsFilter(ge=2)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording_list[1].hash
    assert results[1].hash == recording_list[2].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.ChannelsFilter(le=2)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording_list[0].hash
    assert results[1].hash == recording_list[1].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.ChannelsFilter(eq=2)],
    )
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash


async def test_latitude_filter(
    session: AsyncSession,
    create_test_recording,
):
    """Test the latitude filter."""
    # Arrange
    recording_list = [
        await create_test_recording(latitude=0.0),
        await create_test_recording(latitude=1.0),
    ]

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.LatitudeFilter(gt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.LatitudeFilter(lt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[0].hash


async def test_longitude_filter(
    session: AsyncSession,
    create_test_recording,
):
    """Test the longitude filter."""
    # Arrange
    recording_list = [
        await create_test_recording(longitude=0.0),
        await create_test_recording(longitude=1.0),
    ]

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.LongitudeFilter(gt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.LongitudeFilter(lt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[0].hash


async def test_date_filter(
    session: AsyncSession,
    create_test_recording,
):
    """Test the date filter."""
    # Arrange
    recording_list = [
        await create_test_recording(date=datetime.date(2020, 1, 1)),
        await create_test_recording(date=datetime.date(2020, 1, 2)),
        await create_test_recording(date=datetime.date(2020, 1, 3)),
    ]

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[
            filters.recordings.DateFilter(before=datetime.date(2020, 1, 2))
        ],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[0].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[
            filters.recordings.DateFilter(after=datetime.date(2020, 1, 2))
        ],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[2].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.DateFilter(on=datetime.date(2020, 1, 2))],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash


async def test_time_filter(
    session: AsyncSession,
    create_test_recording,
):
    """Test the time filter."""
    # Arrange
    recording_list = [
        await create_test_recording(time=datetime.time(0, 0, 0)),
        await create_test_recording(time=datetime.time(0, 0, 2)),
    ]

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.TimeFilter(before=datetime.time(0, 0, 1))],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[0].hash

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.TimeFilter(after=datetime.time(0, 0, 1))],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash


async def test_tag_filter(
    session: AsyncSession,
    create_test_recording,
    tag: schemas.Tag,
):
    """Test the tag filter."""
    # Arrange
    recording_list = [
        await create_test_recording(),
        await create_test_recording(),
    ]
    await api.recordings.add_tag_to_recording(
        session=session,
        recording_id=recording_list[0].id,
        tag_id=tag.id,
    )

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.TagFilter(tag=tag)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[0].hash


async def test_issues_filter(
    session: AsyncSession,
    create_test_recording,
    user: schemas.User,
):
    """Test the issues filter."""
    # Arrange
    recording_list = [
        await create_test_recording(),
        await create_test_recording(),
    ]

    note = await api.notes.create_note(
        session=session,
        data=schemas.NoteCreate(
            message="Test",
            created_by_id=user.id,
            is_issue=True,
        ),
    )

    await api.recordings.add_note_to_recording(
        session=session,
        recording_id=recording_list[1].id,
        note_id=note.id,
    )

    # Act
    results = await api.recordings.get_recordings(
        session=session,
        filters=[filters.recordings.IssuesFilter(has_issues=True)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording_list[1].hash
