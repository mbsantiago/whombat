"""Test suite for API clip functions."""
from collections.abc import Callable
from pathlib import Path
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import clips, features, recordings, tags
from whombat.database import models


async def test_create_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a clip."""
    # Arrange
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash,
    )
    db_recording = (await session.execute(query)).scalar_one()

    # Act
    clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Assert
    assert isinstance(clip, schemas.Clip)
    assert clip.start_time == 0.0
    assert clip.end_time == 0.5
    assert clip.recording.hash == db_recording.hash

    # Make sure the clip was added to the database
    query = select(models.Clip).where(
        models.Clip.uuid == clip.uuid,
    )
    db_clip = (await session.execute(query)).scalar_one()
    assert db_clip.start_time == 0.0
    assert db_clip.end_time == 0.5
    assert db_clip.recording_id == db_recording.id


async def test_create_clip_creates_duration_feature(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a clip creates a duration feature."""
    # Act
    clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Assert
    assert isinstance(clip, schemas.Clip)
    assert clip.features[0].name == "duration"
    assert clip.features[0].value == 0.5


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
    recording: schemas.Recording,
):
    """Test creating a clip fails if the clip already exists."""
    # Arrange
    await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act & Assert
    with pytest.raises(exceptions.DuplicateObjectError):
        await clips.create_clip(
            session,
            recording,
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
        await clips.create_clip(
            session,
            recording,
            start_time=0.5,
            end_time=0.0,
        )


async def test_get_clips(
    session: AsyncSession,
    recording: schemas.Recording,
    random_wav_factory: Callable[..., Path],
):
    """Test getting clips."""
    # Arrange
    await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    recording2 = await recordings.create_recording(
        session,
        random_wav_factory(),
    )

    await clips.create_clip(
        session,
        recording2,
        start_time=0.5,
        end_time=1.0,
    )

    # Act
    db_clips = await clips.get_clips(session)

    # Assert
    assert len(db_clips) == 2
    assert db_clips[0].recording == recording
    assert db_clips[0].start_time == 0.0
    assert db_clips[0].end_time == 0.5
    assert db_clips[1].recording == recording2
    assert db_clips[1].start_time == 0.5
    assert db_clips[1].end_time == 1.0


async def test_create_clips(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating clips."""
    # Arrange
    recording1 = await recordings.create_recording(
        session,
        random_wav_factory(),
    )

    recording2 = await recordings.create_recording(
        session,
        random_wav_factory(),
    )

    # Act
    created_clips = await clips.create_clips(
        session,
        recordings=[recording1, recording2],
        start_times=[0.0, 0.5],
        end_times=[0.5, 1.0],
    )

    # Assert
    assert len(created_clips) == 2
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording1
    assert created_clips[1].start_time == 0.5
    assert created_clips[1].end_time == 1.0
    assert created_clips[1].recording == recording2

    # Make sure the clips were added to the database
    query = select(models.Clip).where(
        models.Clip.uuid == created_clips[0].uuid,
    )
    db_clip = (await session.execute(query)).scalar_one()
    assert db_clip is not None

    query = select(models.Clip).where(
        models.Clip.uuid == created_clips[1].uuid,
    )
    db_clip = (await session.execute(query)).scalar_one()
    assert db_clip is not None


async def create_clips_ignores_non_existing_recordings(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
):
    """Test creating clips ignores non-existing recordings."""
    # Arrange
    recording = await recordings.create_recording(
        session,
        random_wav_factory(),
    )

    fake_recording = schemas.Recording.from_file(path=random_wav_factory())

    # Act
    created_clips = await clips.create_clips(
        session,
        recordings=[recording, fake_recording],
        start_times=[0.0, 0.5],
        end_times=[0.5, 1.0],
    )

    # Assert
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording

    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 1


async def test_create_clips_ignores_invalid_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips ignores invalid clips."""
    # Act
    created_clips = await clips.create_clips(
        session,
        recordings=[recording, recording, recording],
        start_times=[0.0, 0.5, 0.5],
        end_times=[0.5, 1.0, 0.0],
    )

    # Assert
    assert len(created_clips) == 2
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording
    assert created_clips[1].start_time == 0.5
    assert created_clips[1].end_time == 1.0
    assert created_clips[1].recording == recording

    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 2


async def test_get_clips_with_limit(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting clips with a limit."""
    # Arrange
    await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )
    await clips.create_clip(
        session,
        recording,
        start_time=0.5,
        end_time=1.0,
    )

    # Act
    db_clips = await clips.get_clips(
        session,
        limit=1,
    )

    # Assert
    assert len(db_clips) == 1
    assert db_clips[0].recording == recording
    assert db_clips[0].start_time == 0.0
    assert db_clips[0].end_time == 0.5


async def test_get_clips_with_offset(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting clips with an offset."""
    # Arrange
    await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )
    await clips.create_clip(
        session,
        recording,
        start_time=0.5,
        end_time=1.0,
    )

    # Act
    db_clips = await clips.get_clips(
        session,
        offset=1,
    )

    # Assert
    assert len(db_clips) == 1
    assert db_clips[0].recording == recording
    assert db_clips[0].start_time == 0.5
    assert db_clips[0].end_time == 1.0


async def test_create_clips_ignores_duplicate_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips ignores duplicate clips."""
    # Arrange

    # Act
    created_clips = await clips.create_clips(
        session,
        recordings=[recording, recording],
        start_times=[0.0, 0.0],
        end_times=[0.5, 0.5],
    )

    # Assert
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording

    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 1


async def test_create_clips_ignores_existing_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips ignores existing clips."""
    # Arrange
    await clips.create_clip(
        session,
        recording=recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    created_clips = await clips.create_clips(
        session,
        recordings=[recording, recording],
        start_times=[0.0, 0.5],
        end_times=[0.5, 1.0],
    )

    # Assert
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.5
    assert created_clips[0].end_time == 1.0
    assert created_clips[0].recording == recording

    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 2


async def test_create_clips_add_duration_feature(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips adds duration feature."""
    # Arrange

    # Act
    created_clips = await clips.create_clips(
        session,
        recordings=[recording],
        start_times=[0.3],
        end_times=[0.8],
    )

    # Assert
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.3
    assert created_clips[0].end_time == 0.8
    assert created_clips[0].recording == recording

    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 1
    assert all_clips[0].features[0].name == "duration"
    assert all_clips[0].features[0].value == 0.5


async def test_get_clip_by_uuid(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting a clip by UUID."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    clip = await clips.get_clip_by_uuid(
        session,
        created_clip.uuid,
    )

    # Assert
    assert clip == created_clip


async def test_get_clip_by_uuid_raises_not_found(
    session: AsyncSession,
):
    """Test getting a clip by UUID raises not found."""
    # Arrange

    # Act
    with pytest.raises(exceptions.NotFoundError):
        await clips.get_clip_by_uuid(
            session,
            uuid4(),
        )


async def test_add_feature_to_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a feature to a clip."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    feature = await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    # Act
    updated_clip = await clips.add_feature_to_clip(
        session,
        feature=feature,
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.features) == 2
    assert updated_clip.features[0].name == "duration"
    assert updated_clip.features[0].value == 0.5
    assert updated_clip.features[1].name == "test_feature"
    assert updated_clip.features[1].value == 10

    # Make sure the clip feature is in the database
    query = (
        select(models.ClipFeature)
        .join(models.ClipFeature.clip)
        .join(models.ClipFeature.feature_name)
        .where(
            models.Clip.uuid == created_clip.uuid,
            models.FeatureName.name == "test_feature",
        )
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None


async def test_add_feature_to_clip_fails_if_clip_does_not_exist(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a feature to a clip fails if the clip does not exist."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await clips.add_feature_to_clip(
            session,
            feature=schemas.Feature(name="test_feature", value=10),
            clip=schemas.Clip(
                recording=recording,
                start_time=0.0,
                end_time=0.5,
            ),
        )


async def test_add_feature_to_clip_with_nonexistent_feature_succeeds(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a feature to a clip with a nonexistent feature succeeds."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    updated_clip = await clips.add_feature_to_clip(
        session,
        feature=schemas.Feature(name="test_feature", value=10),
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.features) == 2
    assert updated_clip.features[0].name == "duration"
    assert updated_clip.features[0].value == 0.5
    assert updated_clip.features[1].name == "test_feature"
    assert updated_clip.features[1].value == 10

    # Make sure the feature name was created
    query = select(models.FeatureName).where(
        models.FeatureName.name == "test_feature",
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None

    # Make sure the clip feature is in the database
    query = (
        select(models.ClipFeature)
        .join(models.ClipFeature.clip)
        .join(models.ClipFeature.feature_name)
        .where(
            models.Clip.uuid == created_clip.uuid,
            models.FeatureName.name == "test_feature",
        )
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None


async def test_add_feature_to_clip_is_idempotent(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a feature to a clip is idempotent."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    feature = await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    # Act
    updated_clip = await clips.add_feature_to_clip(
        session,
        feature=feature,
        clip=created_clip,
    )

    updated_clip = await clips.add_feature_to_clip(
        session,
        feature=feature,
        clip=updated_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.features) == 2
    assert updated_clip.features[0].name == "duration"
    assert updated_clip.features[0].value == 0.5
    assert updated_clip.features[1].name == "test_feature"
    assert updated_clip.features[1].value == 10

    retrieved_clip = await clips.get_clip_by_uuid(
        session,
        created_clip.uuid,
    )
    assert len(retrieved_clip.features) == 2
    assert retrieved_clip.features[0].name == "duration"
    assert retrieved_clip.features[0].value == 0.5
    assert retrieved_clip.features[1].name == "test_feature"
    assert retrieved_clip.features[1].value == 10


async def test_add_tag_to_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a tag to a clip."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    tag = await tags.create_tag(
        session,
        key="test_key",
        value="test_tag",
    )

    # Act
    updated_clip = await clips.add_tag_to_clip(
        session,
        tag=tag,
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.tags) == 1
    assert updated_clip.tags[0].key == "test_key"
    assert updated_clip.tags[0].value == "test_tag"

    # Make sure the clip tag is in the database
    query = (
        select(models.ClipTag)
        .join(models.ClipTag.clip)
        .join(models.ClipTag.tag)
        .where(
            models.Clip.uuid == created_clip.uuid,
            models.Tag.key == "test_key",
            models.Tag.value == "test_tag",
        )
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None


async def test_add_tag_to_clip_is_idempotent(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a tag to a clip is idempotent."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    tag = await tags.create_tag(
        session,
        key="test_key",
        value="test_tag",
    )

    # Act
    updated_clip = await clips.add_tag_to_clip(
        session,
        tag=tag,
        clip=created_clip,
    )

    updated_clip = await clips.add_tag_to_clip(
        session,
        tag=tag,
        clip=updated_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.tags) == 1
    assert updated_clip.tags[0].key == "test_key"
    assert updated_clip.tags[0].value == "test_tag"

    retrieved_clip = await clips.get_clip_by_uuid(
        session,
        created_clip.uuid,
    )
    assert len(retrieved_clip.tags) == 1
    assert retrieved_clip.tags[0].key == "test_key"
    assert retrieved_clip.tags[0].value == "test_tag"


async def test_add_tag_to_clip_with_nonexisting_tag_succeeds(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a tag to a clip with a nonexisting tag succeeds."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    tag = schemas.Tag(
        key="test_key",
        value="test_tag",
    )

    # Act
    updated_clip = await clips.add_tag_to_clip(
        session,
        tag=tag,
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.tags) == 1
    assert updated_clip.tags[0].key == "test_key"
    assert updated_clip.tags[0].value == "test_tag"

    # Make sure the clip tag is in the database
    query = (
        select(models.ClipTag)
        .join(models.ClipTag.clip)
        .join(models.ClipTag.tag)
        .where(
            models.Clip.uuid == created_clip.uuid,
            models.Tag.key == "test_key",
            models.Tag.value == "test_tag",
        )
    )
    result = await session.execute(query)
    assert result.scalars().first() is not None


async def test_add_tag_to_clip_fails_with_nonexisting_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test adding a tag to a clip fails with a nonexisting clip."""
    # Arrange
    tag = await tags.create_tag(
        session,
        key="test_key",
        value="test_tag",
    )

    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await clips.add_tag_to_clip(
            session,
            tag=tag,
            clip=schemas.Clip(
                uuid=uuid4(),
                recording=recording,
                start_time=0.0,
                end_time=0.5,
            ),
        )


async def test_delete_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test deleting a clip."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    await clips.delete_clip(
        session,
        created_clip,
    )

    # Assert
    query = select(models.Clip).where(models.Clip.uuid == created_clip.uuid)
    result = await session.execute(query)
    assert result.scalars().first() is None


async def test_delete_clip_ignores_nonexisting_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test deleting a clip ignores nonexisting clips."""
    # Act
    await clips.delete_clip(
        session,
        schemas.Clip(
            recording=recording,
            start_time=0.0,
            end_time=0.5,
        ),
    )


async def test_delete_clip_deletes_associated_tags_and_features(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test deleting a clip deletes associated tags and features."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    tag = await tags.create_tag(
        session,
        key="test_key",
        value="test_tag",
    )

    feature = await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    await clips.add_tag_to_clip(
        session,
        tag=tag,
        clip=created_clip,
    )

    await clips.add_feature_to_clip(
        session,
        feature=feature,
        clip=created_clip,
    )

    # Act
    await clips.delete_clip(
        session,
        created_clip,
    )

    # Assert
    query = select(models.Clip).where(models.Clip.uuid == created_clip.uuid)
    result = await session.execute(query)
    assert result.scalars().first() is None

    # Clip tag was deleted
    query = (
        select(models.ClipTag)
        .join(models.ClipTag.clip)
        .join(models.ClipTag.tag)
        .where(
            models.Tag.key == "test_key",
            models.Tag.value == "test_tag",
            models.Clip.uuid == created_clip.uuid,
        )
    )
    result = await session.execute(query)
    assert result.scalars().first() is None

    # Clip feature was deleted
    query = (
        select(models.ClipFeature)
        .join(models.ClipFeature.clip)
        .join(models.ClipFeature.feature_name)
        .where(
            models.FeatureName.name == "test_feature",
            models.Clip.uuid == created_clip.uuid,
        )
    )
    result = await session.execute(query)
    assert result.scalars().first() is None


async def test_remove_tag_from_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a tag from a clip."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    tag = await tags.create_tag(
        session,
        key="test_key",
        value="test_tag",
    )

    await clips.add_tag_to_clip(
        session,
        tag=tag,
        clip=created_clip,
    )

    # Act
    updated_clip = await clips.remove_tag_from_clip(
        session,
        tag=tag,
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.tags) == 0

    retrieved_clip = await clips.get_clip_by_uuid(
        session,
        created_clip.uuid,
    )
    assert len(retrieved_clip.tags) == 0


async def test_remove_tag_from_clip_fails_with_nonexisting_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a tag from a clip fails with a nonexisting clip."""
    # Arrange
    tag = await tags.create_tag(
        session,
        key="test_key",
        value="test_tag",
    )

    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await clips.remove_tag_from_clip(
            session,
            tag=tag,
            clip=schemas.Clip(
                uuid=uuid4(),
                recording=recording,
                start_time=0.0,
                end_time=0.5,
            ),
        )


async def test_remove_tag_from_clip_ignores_nonexisting_clip_tag(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a tag from a clip ignores a nonexisting clip tag."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    tag = await tags.create_tag(
        session,
        key="test_key",
        value="test_tag",
    )

    # Act
    updated_clip = await clips.remove_tag_from_clip(
        session,
        tag=tag,
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.tags) == 0


async def test_remove_tag_from_clip_ignores_nonexisting_tag(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a tag from a clip ignores a nonexisting tag."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    updated_clip = await clips.remove_tag_from_clip(
        session,
        tag=schemas.Tag(
            key="test_key",
            value="test_tag",
        ),
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.tags) == 0


async def test_remove_feature_from_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a feature from a clip."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    feature = await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    await clips.add_feature_to_clip(
        session,
        feature=feature,
        clip=created_clip,
    )

    # Act
    updated_clip = await clips.remove_feature_from_clip(
        session,
        feature=feature,
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.features) == 1
    assert updated_clip.features[0].name == "duration"
    assert updated_clip.features[0].value == 0.5

    retrieved_clip = await clips.get_clip_by_uuid(
        session,
        created_clip.uuid,
    )
    assert len(retrieved_clip.features) == 1
    assert retrieved_clip.features[0].name == "duration"
    assert retrieved_clip.features[0].value == 0.5


async def test_remove_feature_from_clip_fails_with_nonexisting_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a feature from a clip fails with a nonexisting clip."""
    # Arrange
    feature = await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await clips.remove_feature_from_clip(
            session,
            feature=feature,
            clip=schemas.Clip(
                uuid=uuid4(),
                recording=recording,
                start_time=0.0,
                end_time=0.5,
            ),
        )


async def test_remove_feature_from_clip_ignores_nonexisting_clip_feature(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a clip feature ignores a nonexisting clip feature."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    feature = await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    # Act
    updated_clip = await clips.remove_feature_from_clip(
        session,
        feature=feature,
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.features) == 1


async def test_remove_feature_from_clip_ignores_nonexisting_feature(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test removing a feature from a clip ignores a nonexisting feature."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    updated_clip = await clips.remove_feature_from_clip(
        session,
        feature=schemas.Feature(
            name="test_feature",
            value=10,
        ),
        clip=created_clip,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == created_clip.uuid
    assert len(updated_clip.features) == 1


async def test_update_clip_feature(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a clip feature."""
    # Arrange
    clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    feature = await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    clip = await clips.add_feature_to_clip(
        session,
        feature=feature,
        clip=clip,
    )

    # Act
    updated_clip = await clips.update_clip_feature(
        session,
        clip=clip,
        name="test_feature",
        value=20,
    )

    # Assert
    assert isinstance(updated_clip, schemas.Clip)
    assert updated_clip.uuid == clip.uuid
    assert len(updated_clip.features) == 2
    assert updated_clip.features[1].name == "test_feature"
    assert updated_clip.features[1].value == 20

    retrieved_clip = await clips.get_clip_by_uuid(
        session,
        clip.uuid,
    )
    assert len(retrieved_clip.features) == 2
    assert retrieved_clip.features[1].value == 20
    assert retrieved_clip.features[1].name == "test_feature"


async def test_update_clip_feature_fails_with_nonexisting_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a clip feature fails with a nonexisting clip."""
    # Arrange
    await features.create_feature(
        session,
        name="test_feature",
        value=10,
    )

    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await clips.update_clip_feature(
            session,
            clip=schemas.Clip(
                uuid=uuid4(),
                recording=recording,
                start_time=0.0,
                end_time=0.5,
            ),
            name="test_feature",
            value=20,
        )


async def test_update_clip_feature_creates_clip_feature_if_missing(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test updating a clip feature creates the clip feature if missing."""
    # Arrange
    created_clip = await clips.create_clip(
        session,
        recording,
        start_time=0.0,
        end_time=0.5,
    )

    # Act
    await clips.update_clip_feature(
        session,
        clip=created_clip,
        name="test_feature",
        value=20,
    )

    retrieved_clip = await clips.get_clip_by_uuid(
        session,
        created_clip.uuid,
    )
    assert len(retrieved_clip.features) == 2
    assert retrieved_clip.features[1].value == 20
    assert retrieved_clip.features[1].name == "test_feature"
