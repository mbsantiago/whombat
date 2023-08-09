"""Test suit for the Sound Events Python API module."""
import logging
from collections.abc import Callable
from pathlib import Path
from uuid import UUID

import pytest
import sqlalchemy.orm as orm
from soundevent.data import geometries
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import sound_events
from whombat.database import models

logging.getLogger("aiosqlite").setLevel(logging.ERROR)


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
    assert db_sound_event.geometry == '{"type":"TimeStamp","coordinates":0.5}'


async def test_create_a_timeinterval_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    sound_event = await sound_events.create_sound_event(
        session,
        recording=recording,
        geometry=geometries.TimeInterval(
            coordinates=[0.5, 0.6],
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "TimeInterval"
    assert sound_event.geometry == geometries.TimeInterval(
        coordinates=[0.5, 0.6],
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
        == '{"type":"TimeInterval","coordinates":[0.5,0.6]}'
    )


async def test_create_a_bbox_sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a sound event."""
    sound_event = await sound_events.create_sound_event(
        session,
        recording=recording,
        geometry=geometries.BoundingBox(
            coordinates=[0.5, 0.6, 0.7, 0.8],
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "BoundingBox"
    assert sound_event.geometry == geometries.BoundingBox(
        coordinates=[0.5, 0.6, 0.7, 0.8],
    )

    # make sure the sound event is in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid == sound_event.uuid,
    )
    result = await session.execute(stmt)
    db_sound_event = result.scalars().first()
    assert db_sound_event is not None
    assert db_sound_event.geometry_type == "BoundingBox"
    assert (
        db_sound_event.geometry
        == '{"type":"BoundingBox","coordinates":[0.5,0.6,0.7,0.8]}'
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
            coordinates=[0.5, 0.6],
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "Point"
    assert sound_event.geometry == geometries.Point(
        coordinates=[0.5, 0.6],
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
        db_sound_event.geometry == '{"type":"Point","coordinates":[0.5,0.6]}'
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
            coordinates=[[0.5, 0.6], [0.7, 0.8]],
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "LineString"
    assert sound_event.geometry == geometries.LineString(
        coordinates=[[0.5, 0.6], [0.7, 0.8]],
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
        == '{"type":"LineString","coordinates":[[0.5,0.6],[0.7,0.8]]}'
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
            coordinates=[[[0.5, 0.6], [0.7, 0.8], [0.9, 1.0]]],
        ),
    )

    assert isinstance(sound_event, schemas.SoundEvent)
    assert sound_event.geometry_type == "Polygon"
    assert sound_event.geometry == geometries.Polygon(
        coordinates=[[[0.5, 0.6], [0.7, 0.8], [0.9, 1.0]]],
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
        '{"type":"Polygon","coordinates":[[[0.5,0.6],' "[0.7,0.8],[0.9,1.0]]]}"
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


async def test_create_sound_events(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating multiple sound events at once."""
    geometries_to_create: list[geometries.Geometry] = [
        geometries.TimeStamp(
            coordinates=0.5,
        ),
        geometries.TimeStamp(
            coordinates=0.6,
        ),
    ]

    created_sound_events = await sound_events.create_sound_events(
        session,
        recording,
        geometries=geometries_to_create,
    )

    assert len(created_sound_events) == 2
    for sound_event in created_sound_events:
        assert isinstance(sound_event, schemas.SoundEvent)
        assert sound_event.geometry_type == "TimeStamp"

    assert created_sound_events[0].geometry == geometries.TimeStamp(
        coordinates=0.5,
    )
    assert created_sound_events[1].geometry == geometries.TimeStamp(
        coordinates=0.6,
    )

    # make sure the sound events are in the database
    stmt = select(models.SoundEvent).where(
        models.SoundEvent.uuid.in_(
            [sound_event.uuid for sound_event in created_sound_events],
        ),
    )
    result = await session.execute(stmt)
    db_sound_events = result.scalars().all()
    assert len(db_sound_events) == 2
    for db_sound_event in db_sound_events:
        assert db_sound_event is not None
        assert db_sound_event.geometry_type == "TimeStamp"

    assert (
        db_sound_events[0].geometry == '{"type":"TimeStamp","coordinates":0.5}'
    )
    assert (
        db_sound_events[1].geometry == '{"type":"TimeStamp","coordinates":0.6}'
    )


async def test_create_sound_events_with_different_geometries(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating multiple sound events with different geometries."""
    geometries_to_create = [
        geometries.TimeStamp(
            coordinates=0.5,
        ),
        geometries.Point(
            coordinates=[0.5, 0.6],
        ),
    ]

    created_sound_events = await sound_events.create_sound_events(
        session,
        recording,
        geometries=geometries_to_create,
    )

    assert len(created_sound_events) == 2


async def test_create_sound_events_fails_if_recording_does_not_exist(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating sound events fails if the recording does not exist."""
    fake_recording = schemas.Recording.from_file(random_wav_factory())

    geometry = geometries.TimeStamp(coordinates=0.5)

    with pytest.raises(exceptions.NotFoundError):
        await sound_events.create_sound_events(
            session,
            fake_recording,
            geometries=[geometry],
        )


async def test_create_sound_events_with_tags(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating sound events with associated list of tags."""
    # Arrange
    geometries_to_create: list[geometries.Geometry] = [
        geometries.TimeStamp(coordinates=0.5),
        geometries.TimeStamp(coordinates=0.6),
    ]

    tags_to_use: list[list[schemas.Tag] | None] = [
        [schemas.Tag(key="key1", value="value1")],
        [schemas.Tag(key="key2", value="value2")],
    ]

    # Act
    created_sound_events = await sound_events.create_sound_events(
        session,
        recording,
        geometries=geometries_to_create,
        tags=tags_to_use,
    )

    # Assert
    assert len(created_sound_events) == 2
    assert created_sound_events[0].tags == tags_to_use[0]
    assert created_sound_events[1].tags == tags_to_use[1]

    # Make sure the sound event tags are in the database
    stmt = (
        select(models.SoundEventTag)
        .join(models.SoundEventTag.sound_event)
        .options(orm.joinedload(models.SoundEventTag.tag))
        .where(
            models.SoundEvent.uuid.in_(
                [sound_event.uuid for sound_event in created_sound_events],
            )
        )
    )
    result = await session.execute(stmt)
    db_sound_event_tags = result.scalars().all()
    assert len(db_sound_event_tags) == 2
    assert db_sound_event_tags[0].tag.key == "key1"
    assert db_sound_event_tags[0].tag.value == "value1"
    assert db_sound_event_tags[1].tag.key == "key2"
    assert db_sound_event_tags[1].tag.value == "value2"


async def test_create_sound_events_with_features(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test create_sound_events function with features added."""
    # Arrange
    geometries_to_create: list[geometries.Geometry] = [
        geometries.TimeStamp(coordinates=0.5),
        geometries.TimeStamp(coordinates=0.6),
    ]

    features_to_add: list[list[schemas.Feature] | None] = [
        [schemas.Feature(name="feature1", value=1)],
        [schemas.Feature(name="feature2", value=3)],
    ]

    # Act
    created_sound_events = await sound_events.create_sound_events(
        session,
        recording,
        geometries=geometries_to_create,
        features=features_to_add,
    )

    # Assert
    assert len(created_sound_events) == 2
    assert all(
        feat in created_sound_events[0].features
        for feat in features_to_add[0] or []
    )
    assert all(
        feat in created_sound_events[1].features
        for feat in features_to_add[1] or []
    )

    # Make sure the Feature Names are in the database
    stmt = select(models.FeatureName).where(
        models.FeatureName.name.in_(["feature1", "feature2"])
    )
    result = await session.execute(stmt)
    db_feature_names = result.scalars().all()
    assert len(db_feature_names) == 2
