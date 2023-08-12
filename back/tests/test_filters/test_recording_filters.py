"""Test suite for recording filters."""
import datetime
from pathlib import Path
from typing import Callable

from sqlalchemy.ext.asyncio import AsyncSession

import whombat.filters.recordings as filters
from whombat import schemas
from whombat.api import notes, recordings, tags


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

    path3 = random_wav_factory(channels=5)
    recording3 = await recordings.create_recording(
        session=session,
        path=path3,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.ChannelsFilter(gt=3)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording2.hash
    assert results[1].hash == recording3.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.ChannelsFilter(lt=3)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording1.hash
    assert results[1].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.ChannelsFilter(eq=3)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash


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


async def test_latitude_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the latitude filter."""
    # Arrange
    path1 = random_wav_factory()
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
        latitude=0.0,
    )

    path2 = random_wav_factory()
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
        latitude=1.0,
    )

    path3 = random_wav_factory()
    recording3 = await recordings.create_recording(
        session=session,
        path=path3,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LatitudeFilter(gt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LatitudeFilter(lt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LatitudeFilter(is_null=True)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording3.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LatitudeFilter(is_null=False)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording1.hash
    assert results[1].hash == recording2.hash


async def test_longitude_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the longitude filter."""
    # Arrange
    path1 = random_wav_factory()
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
        longitude=0.0,
    )

    path2 = random_wav_factory()
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
        longitude=1.0,
    )

    path3 = random_wav_factory()
    recording3 = await recordings.create_recording(
        session=session,
        path=path3,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LongitudeFilter(gt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LongitudeFilter(lt=0.5)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LongitudeFilter(is_null=True)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording3.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.LongitudeFilter(is_null=False)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording1.hash
    assert results[1].hash == recording2.hash


async def test_date_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the date filter."""
    # Arrange
    path1 = random_wav_factory()
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
        date=datetime.date(2020, 1, 1),
    )

    path2 = random_wav_factory()
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
        date=datetime.date(2020, 1, 3),
    )

    path3 = random_wav_factory()
    recording3 = await recordings.create_recording(
        session=session,
        path=path3,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.DateFilter(before=datetime.date(2020, 1, 2))],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.DateFilter(after=datetime.date(2020, 1, 2))],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.DateFilter(is_null=True)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording3.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.DateFilter(is_null=False)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording1.hash
    assert results[1].hash == recording2.hash


async def test_time_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the time filter."""
    # Arrange
    path1 = random_wav_factory()
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
        time=datetime.time(0, 0, 0),
    )

    path2 = random_wav_factory()
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
        time=datetime.time(0, 0, 1),
    )

    path3 = random_wav_factory()
    recording3 = await recordings.create_recording(
        session=session,
        path=path3,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.TimeFilter(before=datetime.time(0, 0, 0, 500000))],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.TimeFilter(after=datetime.time(0, 0, 0, 500000))],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording2.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.TimeFilter(is_null=True)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording3.hash

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.TimeFilter(is_null=False)],
    )

    # Assert
    assert len(results) == 2
    assert results[0].hash == recording1.hash
    assert results[1].hash == recording2.hash


async def test_tag_filter(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test the tag filter."""
    path1 = random_wav_factory()
    recording1 = await recordings.create_recording(
        session=session,
        path=path1,
        time=datetime.time(0, 0, 0),
    )

    path2 = random_wav_factory()
    recording2 = await recordings.create_recording(
        session=session,
        path=path2,
        time=datetime.time(0, 0, 1),
    )

    path3 = random_wav_factory()
    recording3 = await recordings.create_recording(
        session=session,
        path=path3,
    )

    tag1 = await tags.create_tag(
        session=session, data=schemas.TagCreate(key="key1", value="value1")
    )
    tag2 = await tags.create_tag(
        session=session, data=schemas.TagCreate(key="key1", value="value2")
    )
    tag3 = await tags.create_tag(
        session=session, data=schemas.TagCreate(key="key2", value="value1")
    )

    await recordings.add_tag_to_recording(
        session=session,
        tag=tag1,
        recording=recording1,
    )

    await recordings.add_tag_to_recording(
        session=session,
        tag=tag2,
        recording=recording2,
    )

    await recordings.add_tag_to_recording(
        session=session,
        tag=tag3,
        recording=recording3,
    )

    # Act
    results = await recordings.get_recordings(
        session=session,
        filters=[filters.TagFilter(tag=tag1)],
    )

    # Assert
    assert len(results) == 1
    assert results[0].hash == recording1.hash
