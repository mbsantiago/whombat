"""Test suite for API clip functions."""
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import clips, features


async def test_create_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a clip."""
    # Act
    clip = await clips.create_clip(
        session,
        data=schemas.ClipCreate(
            recording_id=recording.id,
            start_time=0.0,
            end_time=0.5,
        ),
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
    assert clip.features[0].feature_name.name == "duration"
    assert clip.features[0].value == clip.end_time - clip.start_time


async def test_create_clip_fails_if_recording_does_exist(
    session: AsyncSession,
):
    """Test creating a clip fails if the recording does not exist."""
    # Act & Assert
    with pytest.raises(exceptions.NotFoundError):
        await clips.create_clip(
            session,
            data=schemas.ClipCreate(
                recording_id=3,
                start_time=0.0,
                end_time=0.5,
            ),
        )


async def test_create_clip_fails_for_duplicate_clip(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating a clip fails if the clip already exists."""
    data = schemas.ClipCreate(
        recording_id=recording.id,
        start_time=0.0,
        end_time=0.5,
    )

    # Arrange
    await clips.create_clip(session, data=data)

    # Act & Assert
    with pytest.raises(exceptions.DuplicateObjectError):
        await clips.create_clip(session, data=data)


async def test_create_clip_fails_if_end_time_is_less_than_start_time(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clip fails if the end time is less than the start time."""
    # Act & Assert
    with pytest.raises(ValidationError):
        await clips.create_clip(
            session,
            data=schemas.ClipCreate(
                recording_id=recording.id,
                start_time=0.5,
                end_time=0.0,
            ),
        )


async def test_get_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting clips."""
    # Arrange
    await clips.create_clip(
        session,
        data=schemas.ClipCreate(
            recording_id=recording.id,
            start_time=0.0,
            end_time=0.5,
        ),
    )

    await clips.create_clip(
        session,
        data=schemas.ClipCreate(
            recording_id=recording.id,
            start_time=0.5,
            end_time=1.0,
        ),
    )

    # Act
    db_clips = await clips.get_clips(session)

    # Assert
    assert len(db_clips) == 2
    assert db_clips[0].recording == recording
    assert db_clips[0].start_time == 0.0
    assert db_clips[0].end_time == 0.5
    assert db_clips[1].recording == recording
    assert db_clips[1].start_time == 0.5
    assert db_clips[1].end_time == 1.0


async def test_create_clips(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips."""
    # Act
    created_clips = await clips.create_clips(
        session,
        data=[
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.0, end_time=0.5
            ),
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.5, end_time=1.0
            ),
        ],
    )

    # Assert
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
    created_clips = await clips.create_clips(
        session,
        data=[
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.0, end_time=0.5
            ),
            schemas.ClipCreate(recording_id=4, start_time=0.5, end_time=1.0),
        ],
    )

    # Assert
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.0
    assert created_clips[0].end_time == 0.5
    assert created_clips[0].recording == recording

    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 1


async def test_get_clips_with_limit(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test getting clips with a limit."""
    # Arrange
    await clips.create_clips(
        session,
        data=[
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.0, end_time=0.5
            ),
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.5, end_time=1.0
            ),
        ],
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
    await clips.create_clips(
        session,
        data=[
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.0, end_time=0.5
            ),
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.5, end_time=1.0
            ),
        ],
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
    created_clips = await clips.create_clips(
        session,
        data=[
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.0, end_time=0.5
            ),
            schemas.ClipCreate(
                recording_id=recording.id, start_time=0.0, end_time=0.5
            ),
        ],
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
    data = schemas.ClipCreate(
        recording_id=recording.id,
        start_time=0.0,
        end_time=0.5,
    )
    # Arrange
    await clips.create_clip(session, data=data)

    # Act
    created_clips = await clips.create_clips(session, data=[data])

    # Assert
    assert len(created_clips) == 0

    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 1


async def test_create_clips_add_duration_feature(
    session: AsyncSession,
    recording: schemas.Recording,
):
    """Test creating clips adds duration feature."""
    # Arrange
    data = schemas.ClipCreate(
        recording_id=recording.id, start_time=0.3, end_time=0.8
    )

    # Act
    created_clips = await clips.create_clips(session, data=[data])

    # Assert
    assert len(created_clips) == 1
    assert created_clips[0].start_time == 0.3
    assert created_clips[0].end_time == 0.8
    assert created_clips[0].recording == recording
    assert created_clips[0].features

    duration = features.find_feature(created_clips[0].features, "duration")
    assert duration
    assert duration.value == 0.5


async def test_get_clip_by_uuid(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test getting a clip by UUID."""
    # Act
    retrieved_clip = await clips.get_clip_by_uuid(
        session,
        clip.uuid,
    )

    # Assert
    assert clip == retrieved_clip


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
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test adding a feature to a clip."""
    # Act
    updated_clip = await clips.add_feature_to_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=10,
    )

    # Assert
    assert len(updated_clip.features) == 2

    feature = features.find_feature(updated_clip.features, feature_name.name)
    assert feature
    assert feature.value == 10


async def test_add_feature_to_clip_fails_if_clip_does_not_exist(
    session: AsyncSession,
    feature_name: schemas.FeatureName,
):
    """Test adding a feature to a clip fails if the clip does not exist."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await clips.add_feature_to_clip(
            session,
            clip_id=10,
            feature_name_id=feature_name.id,
            value=10,
        )


async def test_add_feature_to_clip_with_nonexistent_feature_fails(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test adding a feature to a clip with a nonexistent feature fails."""
    with pytest.raises(exceptions.NotFoundError):
        await clips.add_feature_to_clip(
            session,
            clip_id=clip.id,
            feature_name_id=10,
            value=10,
        )


async def test_add_feature_to_clip_is_idempotent(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test adding a feature to a clip is idempotent."""
    # Act
    updated_clip = await clips.add_feature_to_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=10,
    )

    updated_clip = await clips.add_feature_to_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=10,
    )

    # Assert
    assert len(updated_clip.features) == 2


async def test_add_tag_to_clip(
    session: AsyncSession,
    clip: schemas.Clip,
    tag: schemas.Tag,
):
    """Test adding a tag to a clip."""
    # Act
    updated_clip = await clips.add_tag_to_clip(
        session,
        clip_id=clip.id,
        tag_id=tag.id,
    )

    # Assert
    assert len(updated_clip.tags) == 1
    assert updated_clip.tags[0].key == tag.key
    assert updated_clip.tags[0].value == tag.value


async def test_add_tag_to_clip_is_idempotent(
    session: AsyncSession,
    clip: schemas.Clip,
    tag: schemas.Tag,
):
    """Test adding a tag to a clip is idempotent."""
    # Act
    updated_clip = await clips.add_tag_to_clip(
        session,
        clip_id=clip.id,
        tag_id=tag.id,
    )

    updated_clip = await clips.add_tag_to_clip(
        session,
        clip_id=clip.id,
        tag_id=tag.id,
    )

    # Assert
    assert len(updated_clip.tags) == 1
    assert updated_clip.tags[0].key == tag.key
    assert updated_clip.tags[0].value == tag.value


async def test_add_tag_to_clip_with_nonexisting_tag_fails(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test adding a tag to a clip with a nonexisting tag fails."""
    with pytest.raises(exceptions.NotFoundError):
        await clips.add_tag_to_clip(
            session,
            clip_id=clip.id,
            tag_id=10,
        )


async def test_add_tag_to_clip_fails_with_nonexisting_clip(
    session: AsyncSession,
    tag: schemas.Tag,
):
    """Test adding a tag to a clip fails with a nonexisting clip."""
    # Arrange
    with pytest.raises(exceptions.NotFoundError):
        await clips.add_tag_to_clip(
            session,
            clip_id=10,
            tag_id=tag.id,
        )


async def test_delete_clip(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test deleting a clip."""
    await clips.delete_clip(session, clip_id=clip.id)
    all_clips = await clips.get_clips(session)
    assert len(all_clips) == 0


async def test_delete_clip_fails_with_nonexisting_clip(
    session: AsyncSession,
):
    """Test deleting a clip ignores nonexisting clips."""
    # Act
    with pytest.raises(exceptions.NotFoundError):
        await clips.delete_clip(session, clip_id=10)


async def test_delete_clip_deletes_associated_tags_and_features(
    session: AsyncSession,
    clip: schemas.Clip,
    tag: schemas.Tag,
    feature_name: schemas.FeatureName,
):
    """Test deleting a clip deletes associated tags and features."""
    # Arrange
    await clips.add_tag_to_clip(
        session,
        clip_id=clip.id,
        tag_id=tag.id,
    )

    await clips.add_feature_to_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=10,
    )

    # Act
    await clips.delete_clip(
        session,
        clip_id=clip.id,
    )

    # Clip tag was deleted
    query = select(models.ClipTag).where(models.ClipTag.clip_id == clip.id)
    result = await session.execute(query)
    assert result.scalars().first() is None

    # Clip feature was deleted
    query = select(models.ClipFeature).where(
        models.ClipFeature.clip_id == clip.id
    )
    result = await session.execute(query)
    assert result.scalars().first() is None


async def test_remove_tag_from_clip(
    session: AsyncSession,
    clip: schemas.Clip,
    tag: schemas.Tag,
):
    """Test removing a tag from a clip."""
    # Arrange
    clip = await clips.add_tag_to_clip(
        session,
        clip_id=clip.id,
        tag_id=tag.id,
    )
    assert len(clip.tags) == 1

    # Act
    clip = await clips.remove_tag_from_clip(
        session,
        clip_id=clip.id,
        tag_id=tag.id,
    )

    # Assert
    assert len(clip.tags) == 0


async def test_remove_tag_from_clip_fails_with_nonexisting_clip(
    session: AsyncSession,
    tag: schemas.Tag,
):
    """Test removing a tag from a clip fails with a nonexisting clip."""
    with pytest.raises(exceptions.NotFoundError):
        await clips.remove_tag_from_clip(
            session,
            clip_id=10,
            tag_id=tag.id,
        )


async def test_remove_nonexisting_tag_from_clip_succeeds(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test removing a tag from a clip ignores a nonexisting clip tag."""
    await clips.remove_tag_from_clip(
        session,
        clip_id=clip.id,
        tag_id=10,
    )


async def test_remove_tag_from_clip_ignores_nonregistered_tag(
    session: AsyncSession,
    clip: schemas.Clip,
    tag: schemas.Tag,
):
    """Test removing a tag from a clip ignores a nonregistered tag."""
    assert len(clip.tags) == 0

    # Act
    clip = await clips.remove_tag_from_clip(
        session,
        clip_id=clip.id,
        tag_id=tag.id,
    )


async def test_remove_feature_from_clip(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test removing a feature from a clip."""
    clip = await clips.add_feature_to_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=10,
    )
    assert len(clip.features) == 2

    # Act
    clip = await clips.remove_feature_from_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
    )

    # Assert
    assert len(clip.features) == 1


async def test_remove_feature_from_clip_fails_with_nonexisting_clip(
    session: AsyncSession,
    feature_name: schemas.FeatureName,
):
    """Test removing a feature from a clip fails with a nonexisting clip."""
    with pytest.raises(exceptions.NotFoundError):
        await clips.remove_feature_from_clip(
            session,
            clip_id=10,
            feature_name_id=feature_name.id,
        )


async def test_remove_feature_from_clip_ignores_nonexisting_clip_feature(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test removing a clip feature ignores a nonexisting clip feature."""
    # Arrange
    await clips.remove_feature_from_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
    )


async def test_remove_nonexisting_feature_from_clip_succeeds(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test removing a feature from a clip ignores a nonexisting feature."""
    await clips.remove_feature_from_clip(
        session,
        clip_id=clip.id,
        feature_name_id=10,
    )


async def test_update_clip_feature(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test updating a clip feature."""
    # Arrange
    clip = await clips.add_feature_to_clip(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=10,
    )

    feature = features.find_feature(clip.features, feature_name.name)
    assert feature is not None
    assert feature.value == 10

    # Act
    clip = await clips.update_clip_feature(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=20,
    )

    assert len(clip.features) == 2
    feature = features.find_feature(clip.features, feature_name.name)
    assert feature is not None
    assert feature.value == 20


async def test_update_clip_feature_fails_with_nonexisting_clip(
    session: AsyncSession,
    feature_name: schemas.FeatureName,
):
    """Test updating a clip feature fails with a nonexisting clip."""
    with pytest.raises(exceptions.NotFoundError):
        await clips.update_clip_feature(
            session,
            clip_id=10,
            feature_name_id=feature_name.id,
            value=20,
        )


async def test_update_clip_feature_creates_clip_feature_if_missing(
    session: AsyncSession,
    clip: schemas.Clip,
    feature_name: schemas.FeatureName,
):
    """Test updating a clip feature creates the clip feature if missing."""
    assert len(clip.features) == 1

    clip = await clips.update_clip_feature(
        session,
        clip_id=clip.id,
        feature_name_id=feature_name.id,
        value=20,
    )

    assert len(clip.features) == 2
