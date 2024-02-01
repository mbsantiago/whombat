"""Test suite for API clip functions."""

from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_create_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a clip."""
    # Act
    clip = await api.clips.create(
        session,
        recording=recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Assert
    assert isinstance(clip, schemas.Clip)
    assert clip.start_time == 0.0
    assert clip.end_time == 0.5
    assert clip.recording.hash == recording.hash

    # Make sure the clip was added to the database
    query = select(models.Clip).where(
        models.Clip.uuid == clip.uuid,
    )
    db_clip = (await session.execute(query)).unique().scalar_one()
    assert db_clip.start_time == 0.0
    assert db_clip.end_time == 0.5
    assert db_clip.recording_id == recording.id


async def test_create_clip_creates_duration_feature(clip: schemas.Clip):
    """Test creating a clip creates a duration feature."""
    assert len(clip.features) == 1
    assert clip.features[0].name == "duration"
    assert clip.features[0].value == clip.end_time - clip.start_time


async def test_create_clip_fails_for_duplicate_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a clip fails if the clip already exists."""
    # Arrange
    await api.clips.create(
        session,
        recording=recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act & Assert
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.clips.create(
            session,
            recording=recording,
            start_time=0.0,
            end_time=0.5,
        )


async def test_create_clip_fails_if_end_time_is_less_than_start_time(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clip fails if the end time is less than the start time."""
    # Act & Assert
    with pytest.raises(ValidationError):
        await api.clips.create(
            session,
            recording=recording,
            start_time=0.5,
            end_time=0.0,
        )


async def test_get_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting clips."""
    # Arrange
    await api.clips.create(
        session,
        recording=recording,
        start_time=0.0,
        end_time=0.5,
    )

    await api.clips.create(
        session,
        recording=recording,
        start_time=0.5,
        end_time=1.0,
    )

    # Act
    db_clips, _ = await api.clips.get_many(session)

    # Assert
    assert len(db_clips) == 2
    assert db_clips[0].recording == recording
    assert db_clips[0].start_time == 0.5
    assert db_clips[0].end_time == 1.0
    assert db_clips[1].recording == recording
    assert db_clips[1].start_time == 0.0
    assert db_clips[1].end_time == 0.5


async def test_create_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips."""
    # Act
    created_clips = await api.clips.create_many_without_duplicates(
        session,
        data=[
            dict(recording_id=recording.id, start_time=0.0, end_time=0.5),
            dict(recording_id=recording.id, start_time=0.5, end_time=1.0),
        ],
    )

    # Assert
    assert created_clips is not None
    assert len(created_clips) == 2
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording
    assert created_clips[1].start_time == 0.5
    assert created_clips[1].end_time == 1.0
    assert created_clips[1].recording == recording

    # Make sure the clips were added to the database
    query = select(models.Clip).where(
        models.Clip.uuid == created_clips[0].uuid,
    )
    db_clip = (await session.execute(query)).unique().scalar_one()
    assert db_clip is not None

    query = select(models.Clip).where(
        models.Clip.uuid == created_clips[1].uuid,
    )
    db_clip = (await session.execute(query)).unique().scalar_one()
    assert db_clip is not None


async def create_clips_ignores_non_existing_recordings(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips ignores non-existing recordings."""
    # Act
    created_clips = await api.clips.create_many_without_duplicates(
        session,
        data=[
            dict(recording_id=recording.id, start_time=0.0, end_time=0.5),
            dict(recording_id=4, start_time=0.5, end_time=1.0),
        ],
    )

    # Assert
    assert created_clips is not None
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording

    all_clips, _ = await api.clips.get_many(session)
    assert len(all_clips) == 1


async def test_get_clips_with_limit(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting clips with a limit."""
    # Arrange
    await api.clips.create_many_without_duplicates(
        session,
        data=[
            dict(recording_id=recording.id, start_time=0.0, end_time=0.5),
            dict(recording_id=recording.id, start_time=0.5, end_time=1.0),
        ],
    )

    # Act
    db_clips, _ = await api.clips.get_many(
        session,
        limit=1,
    )

    # Assert
    assert len(db_clips) == 1
    assert db_clips[0].recording == recording
    assert db_clips[0].start_time == 0.5
    assert db_clips[0].end_time == 1.0


async def test_get_clips_with_offset(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting clips with an offset."""
    await api.clips.create_many_without_duplicates(
        session,
        data=[
            dict(
                recording_id=recording.id,
                start_time=0.0,
                end_time=0.5,
            ),
            dict(
                recording_id=recording.id,
                start_time=0.5,
                end_time=1.0,
            ),
        ],
    )

    # Act
    db_clips, _ = await api.clips.get_many(
        session,
        offset=1,
    )

    # Assert
    assert len(db_clips) == 1
    assert db_clips[0].recording == recording
    assert db_clips[0].start_time == 0.0
    assert db_clips[0].end_time == 0.5


async def test_create_clips_ignores_duplicate_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips ignores duplicate clips."""
    # Arrange
    created_clips = await api.clips.create_many_without_duplicates(
        session,
        data=[
            dict(
                recording_id=recording.id,
                start_time=0.0,
                end_time=0.5,
            ),
            dict(
                recording_id=recording.id,
                start_time=0.0,
                end_time=0.5,
            ),
        ],
    )

    # Assert
    assert created_clips is not None
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording

    all_clips, _ = await api.clips.get_many(session)
    assert len(all_clips) == 1


async def test_create_clips_ignores_existing_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips ignores existing clips."""
    # Arrange
    await api.clips.create(
        session,
        recording=recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    data = dict(
        recording_id=recording.id,
        start_time=0.0,
        end_time=0.5,
    )
    created_clips = await api.clips.create_many_without_duplicates(
        session, data=[data]
    )

    # Assert
    assert created_clips is not None
    assert len(created_clips) == 0

    all_clips, _ = await api.clips.get_many(session)
    assert len(all_clips) == 1


async def test_create_clips_add_duration_feature(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips adds duration feature."""
    # Arrange
    data = dict(
        recording_id=recording.id,
        start_time=0.3,
        end_time=0.8,
    )

    # Act
    created_clips = await api.clips.create_many_without_duplicates(
        session, data=[data]
    )

    # Assert
    assert created_clips is not None
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.3
    assert created_clips[0].end_time == 0.8
    assert created_clips[0].recording == recording

    duration = api.find_feature(created_clips[0].features, "duration")
    assert duration
    assert duration.value == 0.5


async def test_get_clip_by_uuid(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test getting a clip by UUID."""
    # Act
    retrieved_clip = await api.clips.get(
        session,
        clip.uuid,
    )

    # Assert
    assert clip.model_dump() == retrieved_clip.model_dump()
    assert clip == retrieved_clip


async def test_get_clip_by_uuid_raises_not_found(
    session: AsyncSession,
):
    """Test getting a clip by UUID raises not found."""
    # Arrange

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await api.clips.get(
            session,
            uuid4(),
        )


async def test_add_feature_to_clip(
    session: AsyncSession,
    clip: schemas.Clip,
    feature: schemas.Feature,
):
    """Test adding a feature to a clip."""
    updated_clip = await api.clips.add_feature(
        session,
        clip,
        feature=feature,
    )

    # Assert
    assert len(updated_clip.features) == 2

    found = api.find_feature(updated_clip.features, feature.name)
    assert found
    assert found == feature


async def test_add_existing_feature_fails(
    session: AsyncSession,
    clip: schemas.Clip,
    feature: schemas.Feature,
):
    """Test adding a feature to a clip is idempotent."""
    clip = await api.clips.add_feature(
        session,
        clip,
        feature,
    )

    with pytest.raises(exceptions.DuplicateObjectError):
        await api.clips.add_feature(
            session,
            clip,
            feature,
        )


async def test_delete_clip(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test deleting a clip."""
    await api.clips.delete(session, clip)
    all_clips, _ = await api.clips.get_many(session)
    assert len(all_clips) == 0


async def test_delete_clip_deletes_associated_features(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test deleting a clip deletes associated tags and features."""
    feature = await api.features.get_feature(
        session,
        name=feature_name.name,
        value=10,
    )
    await api.clips.add_feature(session, clip, feature)

    # Act
    await api.clips.delete(session, clip)

    # Clip feature was deleted
    query = select(models.ClipFeature).where(
        models.ClipFeature.clip_id == clip.id
    )
    result = await session.execute(query)
    assert result.scalars().first() is None


async def test_remove_feature_from_clip(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test removing a feature from a clip."""
    feature = await api.features.get_feature(
        session,
        name=feature_name.name,
        value=10,
    )

    clip = await api.clips.add_feature(session, clip, feature)
    assert len(clip.features) == 2

    # Act
    clip = await api.clips.remove_feature(session, clip, feature)

    # Assert
    assert len(clip.features) == 1


async def test_update_clip_feature(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test updating a clip feature."""
    # Arrange
    feature = await api.features.get_feature(
        session,
        name=feature_name.name,
        value=10,
    )

    clip = await api.clips.add_feature(session, clip, feature)

    feature = api.find_feature(clip.features, feature_name.name)
    assert feature is not None
    assert feature.value == 10

    updated_feature = feature.model_copy(update=dict(value=20))

    # Act
    clip = await api.clips.update_feature(
        session,
        clip,
        updated_feature,
    )

    assert len(clip.features) == 2
    feature = api.find_feature(clip.features, feature_name.name)
    assert feature is not None
    assert feature.value == 20
