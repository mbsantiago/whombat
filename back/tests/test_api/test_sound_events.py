"""Test suit for the Sound Events Python API module."""
from collections.abc import Callable
from pathlib import Path
from uuid import UUID

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, geometries, schemas
from whombat.api import sound_events
from whombat.database import models


async def test_create_a_timestamp_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    # Act
    sound_event = await sound_events.create_sound_event(
        session,
        recording=recording,
        geometry=geometries.TimeStamp(
            coordinates=0.5,
        ),
    )

    # Assert
    assert isinstance(sound_event, schemas.SoundEvent)
    assert isinstance(sound_event.uuid, UUID)
    assert sound_event.geometry_type == "TimeStamp"
    assert sound_event.geometry == geometries.TimeStamp(
        coordinates=0.5,
    )

    # make sure the sound event is in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid,
    )
    result = await session.execute(stmt)
    db_sound_event = result.scalars().first()
    assert db_sound_event is not None
    assert db_sound_event.geometry_type == "TimeStamp"
    assert (
        db_sound_event.geometry == '{"type": "TimeStamp", "coordinates": 0.5}'
    )


async def test_create_a_timeinterval_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    sound_event = await sound_events.create_sound_event(
        session,
        recording=recording,
        geometry=geometries.TimeInterval(
            coordinates=(0.5, 0.6),
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "TimeInterval"
    assert sound_event.geometry == geometries.TimeInterval(
        coordinates=(0.5, 0.6),
    )

    # make sure the sound event is in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid,
    )
    result = await session.execute(stmt)
    db_sound_event = result.scalars().first()
    assert db_sound_event is not None
    assert db_sound_event.geometry_type == "TimeInterval"
    assert (
        db_sound_event.geometry
        == '{"type": "TimeInterval", "coordinates": [0.5, 0.6]}'
    )


async def test_create_a_point_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    sound_event = await sound_events.create_sound_event(
        session,
        recording=recording,
        geometry=geometries.Point(
            coordinates=(0.5, 0.6),
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "Point"
    assert sound_event.geometry == geometries.Point(
        coordinates=(0.5, 0.6),
    )

    # make sure the sound event is in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid,
    )
    result = await session.execute(stmt)
    db_sound_event = result.scalars().first()
    assert db_sound_event is not None
    assert db_sound_event.geometry_type == "Point"
    assert (
        db_sound_event.geometry
        == '{"type": "Point", "coordinates": [0.5, 0.6]}'
    )


async def test_create_a_linestring_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    sound_event = await sound_events.create_sound_event(
        session,
        recording=recording,
        geometry=geometries.LineString(
            coordinates=[(0.5, 0.6), (0.7, 0.8)],
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "LineString"
    assert sound_event.geometry == geometries.LineString(
        coordinates=[(0.5, 0.6), (0.7, 0.8)],
    )

    # make sure the sound event is in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid,
    )
    result = await session.execute(stmt)
    db_sound_event = result.scalars().first()
    assert db_sound_event is not None
    assert db_sound_event.uuid == sound_event.uuid
    assert db_sound_event.geometry_type == "LineString"
    assert (
        db_sound_event.geometry
        == '{"type": "LineString", "coordinates": [[0.5, 0.6], [0.7, 0.8]]}'
    )


async def test_create_a_polygon_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    sound_event = await sound_events.create_sound_event(
        session,
        recording=recording,
        geometry=geometries.Polygon(
            coordinates=[[(0.5, 0.6), (0.7, 0.8), (0.9, 1.0)]],
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "Polygon"
    assert sound_event.geometry == geometries.Polygon(
        coordinates=[[(0.5, 0.6), (0.7, 0.8), (0.9, 1.0)]],
    )

    # make sure the sound event is in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid,
    )
    result = await session.execute(stmt)
    db_sound_event = result.scalars().first()
    assert db_sound_event is not None
    assert db_sound_event.uuid == sound_event.uuid
    assert db_sound_event.geometry_type == "Polygon"
    assert db_sound_event.geometry == (
        '{"type": "Polygon", "coordinates": [[[0.5, 0.6], '
        "[0.7, 0.8], [0.9, 1.0]]]}"
    )


async def test_create_sound_event_fails_if_recording_does_not_exist(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating a sound event fails if the recording does not exist."""
    fake_recording = schemas.Recording.from_file(
        random_wav_factory(),
    )

    with pytest.raises(exceptions.NotFoundError):
        await sound_events.create_sound_event(
            session,
            recording=fake_recording,
            geometry=geometries.TimeStamp(
                coordinates=0.5,
            ),
        )
