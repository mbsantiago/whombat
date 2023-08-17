"""Test suit for the Sound Events Python API module."""
from uuid import UUID

import pytest
from soundevent.data import geometries
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import sound_events
from whombat.database import models


async def test_create_a_timestamp_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    # Act
    geometry = geometries.TimeStamp(coordinates=0.5)
    sound_event = await sound_events.create_sound_event(
        session,
        data=schemas.SoundEventCreate(
            recording_id=recording.id,
            geometry=geometry,
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
    assert db_sound_event.geometry == geometry


async def test_create_a_timeinterval_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    geometry = geometries.TimeInterval(coordinates=[0.5, 0.6])
    sound_event = await sound_events.create_sound_event(
        session,
        data=schemas.SoundEventCreate(
            recording_id=recording.id,
            geometry=geometry,
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "TimeInterval"
    assert sound_event.geometry == geometry


async def test_create_a_bbox_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    geometry = geometries.BoundingBox(coordinates=[0.5, 0.6, 0.7, 0.8])

    sound_event = await sound_events.create_sound_event(
        session,
        data=schemas.SoundEventCreate(
            recording_id=recording.id,
            geometry=geometry,
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "BoundingBox"
    assert sound_event.geometry == geometry


async def test_create_a_point_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    geometry = geometries.Point(coordinates=[0.5, 0.6])
    sound_event = await sound_events.create_sound_event(
        session,
        data=schemas.SoundEventCreate(
            recording_id=recording.id,
            geometry=geometry,
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "Point"
    assert sound_event.geometry == geometry


async def test_create_a_linestring_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    geometry = geometries.LineString(coordinates=[[0.5, 0.6], [0.7, 0.8]])
    sound_event = await sound_events.create_sound_event(
        session,
        data=schemas.SoundEventCreate(
            recording_id=recording.id,
            geometry=geometry,
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "LineString"
    assert sound_event.geometry == geometry


async def test_create_a_polygon_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    geometry = geometries.Polygon(
        coordinates=[[[0.5, 0.6], [0.7, 0.8], [0.9, 1.0]]],
    )
    sound_event = await sound_events.create_sound_event(
        session,
        data=schemas.SoundEventCreate(
            recording_id=recording.id,
            geometry=geometry,
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "Polygon"
    assert sound_event.geometry == geometry


async def test_create_sound_event_fails_if_recording_does_not_exist(
    session: AsyncSession,
):
    """Test creating a sound event fails if the recording does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await sound_events.create_sound_event(
            session,
            data=schemas.SoundEventCreate(
                recording_id=10,
                geometry=geometries.TimeStamp(
                    coordinates=0.5,
                ),
            ),
        )


async def test_create_sound_events(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating multiple sound events at once."""
    geometry1 = geometries.TimeStamp(coordinates=0.5)
    geometry2 = geometries.TimeStamp(coordinates=0.6)

    data: list[schemas.SoundEventCreate] = [
        schemas.SoundEventCreate(
            recording_id=recording.id, geometry=geometry1
        ),
        schemas.SoundEventCreate(
            recording_id=recording.id, geometry=geometry2
        ),
    ]

    created_sound_events = await sound_events.create_sound_events(
        session, data=data
    )

    assert len(created_sound_events) == 2
    for sound_event in created_sound_events:
        assert isinstance(sound_event, schemas.SoundEvent)
        assert sound_event.geometry_type == "TimeStamp"

    assert created_sound_events[0].geometry == geometry1
    assert created_sound_events[1].geometry == geometry2

    # make sure the sound events are in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid.in_(
            [sound_event.uuid for sound_event in created_sound_events],
        ),
    )
    result = await session.execute(stmt)
    db_sound_events = result.unique().scalars().all()
    assert len(db_sound_events) == 2
    for db_sound_event in db_sound_events:
        assert db_sound_event is not None
        assert db_sound_event.geometry_type == "TimeStamp"

    assert db_sound_events[0].geometry == geometry1
    assert db_sound_events[1].geometry == geometry2


async def test_create_sound_events_with_different_geometries(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating multiple sound events with different geometries."""
    geometries_to_create = [
        geometries.TimeStamp(coordinates=0.5),
        geometries.Point(coordinates=[0.5, 0.6]),
    ]

    created_sound_events = await sound_events.create_sound_events(
        session,
        data=[
            schemas.SoundEventCreate(recording_id=recording.id, geometry=g)
            for g in geometries_to_create
        ],
    )

    assert len(created_sound_events) == 2
