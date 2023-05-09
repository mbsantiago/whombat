"""API functions for interacting with recordings."""

import datetime
from pathlib import Path
from typing import TypeVar

import sqlalchemy.orm as orm
from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.core import files
from whombat.database import models
from whombat.filters.base import Filter
from whombat.schemas.recordings import RecordingCreate, RecordingUpdate

__all__ = [
    "create_recording",
    "get_recording_by_hash",
    "update_recording",
    "get_recordings",
    "delete_recording",
    "add_feature_to_recording",
    "add_note_to_recording",
    "add_tag_to_recording",
    "remove_feature_from_recording",
    "remove_note_from_recording",
    "remove_tag_from_recording",
]

A = TypeVar("A")


def _remove_duplicates(objects: list[A]) -> list[A]:
    """Remove duplicates from a list of objects."""
    return [obj for obj in set(objects)]


async def create_recording(
    session: AsyncSession,
    path: Path,
    date: datetime.date | None = None,
    time: datetime.time | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
) -> schemas.Recording:
    """Create a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    path : Path
        The path to the recording file.
    date : datetime.date, optional
        The date the recording was made, by default None
    time : datetime.time, optional
        The time the recording was made, by default None
    latitude : float, optional
        The latitude of the recording, by default None
    longitude : float, optional
        The longitude of the recording, by default None

    Returns
    -------
    recording : schemas.recordings.Recording
        The created recording.

    Raises
    ------
    pydantic.ValidationError
        If the given path is not an audio file or it does not exist.

    """
    data = RecordingCreate(
        path=path,
        date=date,
        time=time,
        latitude=latitude,
        longitude=longitude,
    )

    hash = files.compute_hash(path)
    media_info = files.get_media_info(path)

    recording = models.Recording(
        hash=hash,
        duration=media_info.duration,
        channels=media_info.channels,
        samplerate=media_info.samplerate,
        date=data.date,
        time=data.time,
        latitude=data.latitude,
        longitude=data.longitude,
    )

    session.add(recording)
    await session.commit()

    return schemas.Recording(
        hash=recording.hash,
        duration=recording.duration,
        channels=recording.channels,
        samplerate=recording.samplerate,
        date=recording.date,
        time=recording.time,
        latitude=recording.latitude,
        longitude=recording.longitude,
    )


def _convert_recording_to_schema(
    recording: models.Recording,
) -> schemas.Recording:
    return schemas.Recording(
        hash=recording.hash,
        duration=recording.duration,
        channels=recording.channels,
        samplerate=recording.samplerate,
        date=recording.date,
        time=recording.time,
        latitude=recording.latitude,
        longitude=recording.longitude,
        features=[
            schemas.Feature(
                name=feature.feature_name.name,
                value=feature.value,
            )
            for feature in recording.features
        ],
        notes=[
            schemas.Note(
                uuid=note.note.uuid,
                message=note.note.message,
                created_at=note.note.created_at,
                created_by=note.note.created_by.username,
                is_issue=note.note.is_issue,
            )
            for note in recording.notes
        ],
        tags=[
            schemas.Tag(
                key=tag.tag.key,
                value=tag.tag.value,
            )
            for tag in recording.tags
        ],
    )


async def get_recording_by_hash(
    session: AsyncSession,
    hash: str,
) -> schemas.Recording:
    """Get a recording by its hash.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    hash : str
        The hash of the recording.

    Returns
    -------
    recording : schemas.recordings.Recording
        The requested recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists.

    """
    query = (
        select(models.Recording)
        .options(
            orm.joinedload(models.Recording.features).subqueryload(
                models.RecordingFeature.feature_name
            ),
            orm.joinedload(models.Recording.notes)
            .subqueryload(models.RecordingNote.note)
            .subqueryload(models.Note.created_by),
            orm.joinedload(models.Recording.tags).subqueryload(
                models.RecordingTag.tag
            ),
        )
        .where(models.Recording.hash == hash)
    )
    result = await session.execute(query)
    recording = result.first()

    if recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    recording = recording[0]
    return _convert_recording_to_schema(recording)

async def update_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    **kwargs,
) -> schemas.Recording:
    """Update a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    recording : schemas.recordings.Recording
        The recording to update.
    data : RecordingUpdate
        The data to update the recording with.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Note
    ----
    This will fail silently if the recording does not exist.

    """
    data = RecordingUpdate(**kwargs)

    stmt = (
        update(models.Recording)
        .where(models.Recording.hash == recording.hash)
        .values(
            **data.dict(exclude_none=True, exclude_unset=True),
        )
    )
    await session.execute(stmt)
    await session.commit()
    return schemas.Recording(
        **{
            **recording.dict(),
            **data.dict(exclude_none=True, exclude_unset=True),
        }
    )


async def get_recordings(
    session: AsyncSession,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
) -> list[schemas.Recording]:
    """Get all recordings.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    limit : int, optional
        The maximum number of recordings to return, by default 100.
        Set to 0 to return all recordings.
    offset : int, optional
        The number of recordings to skip, by default 0

    Returns
    -------
    recordings : list[schemas.recordings.Recording]
        The requested recordings.

    """
    query = (
        select(models.Recording)
        .options(
            orm.joinedload(models.Recording.features).subqueryload(
                models.RecordingFeature.feature_name
            ),
            orm.joinedload(models.Recording.notes)
            .subqueryload(models.RecordingNote.note)
            .subqueryload(models.Note.created_by),
            orm.joinedload(models.Recording.tags).subqueryload(
                models.RecordingTag.tag
            ),
        )
    )

    if filters is None:
        filters = []

    for filter in filters:
        query = filter.filter(query)

    query = query.limit(limit).offset(offset)
    result = await session.execute(query)
    return [
        _convert_recording_to_schema(recording)
        for recording in result.unique().scalars()
    ]


async def delete_recording(
    session: AsyncSession,
    recording: schemas.Recording,
) -> None:
    """Delete a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    recording : schemas.recordings.Recording
        The recording to delete.

    Note
    ----
    This will fail silently if the recording does not exist.

    Warning
    -------
    This will also delete all features, notes, tags and sound events
    associated with the recording. Use with caution.

    """
    stmt = delete(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    await session.execute(stmt)
    await session.commit()


async def add_note_to_recording(
    session: AsyncSession,
    note: schemas.Note,
    recording: schemas.Recording,
) -> schemas.Recording:
    """Add a note to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    note : schemas.notes.Note
        The note to add.
    recording : schemas.recordings.Recording
        The recording to add the note to.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists.

    """
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    # Check if the note already exists
    query = select(models.Note).where(models.Note.uuid == note.uuid)
    result = await session.execute(query)
    db_note = result.scalar_one_or_none()

    if db_note is None:
        # Otherwise, create a new note

        # Get the user who created the note
        query = select(models.User).where(
            models.User.username == note.created_by
        )
        result = await session.execute(query)
        created_by = result.scalar_one_or_none()

        if created_by is None:
            raise exceptions.NotFoundError(
                "No user with the given username exists."
            )

        db_note = models.Note(
            message=note.message,
            created_by_id=created_by.id,
            is_issue=note.is_issue,
        )
        session.add(db_note)
        await session.commit()

    try:
        # Add the note to the recording
        db_recording_note = models.RecordingNote(
            recording_id=db_recording.id,
            note_id=db_note.id,
        )
        session.add(db_recording_note)
        await session.commit()
    except IntegrityError:
        # The note already exists, so just
        # return the recording
        await session.rollback()
        return recording

    updated_note = schemas.Note(
        uuid=db_note.uuid,
        message=db_note.message,
        created_at=db_note.created_at,
        created_by=note.created_by,
        is_issue=db_note.is_issue,
    )
    updated_notes = _remove_duplicates(recording.notes + [updated_note])
    return schemas.Recording(
        **{
            **recording.dict(),
            "notes": updated_notes,
        }
    )


async def add_tag_to_recording(
    session: AsyncSession,
    tag: schemas.Tag,
    recording: schemas.Recording,
) -> schemas.Recording:
    """Add a tag to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    tag : schemas.tags.Tag
        The tag to add.
    recording : schemas.recordings.Recording
        The recording to add the tag to.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists.

    Note
    ----
    The tag will only be added if it does not already exist.
    Otherwise it will be ignored.

    """
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    # Check if the tag already exists
    query = select(models.Tag).filter_by(key=tag.key, value=tag.value)
    result = await session.execute(query)
    db_tag = result.scalar_one_or_none()
    if db_tag is None:
        db_tag = models.Tag(key=tag.key, value=tag.value)
        session.add(db_tag)
        await session.commit()

    try:
        recording_tag = models.RecordingTag(
            recording_id=db_recording.id,
            tag_id=db_tag.id,
        )
        session.add(recording_tag)
        await session.commit()
    except IntegrityError:
        # This tag already exists for this recording
        await session.rollback()
        return recording

    tag = schemas.Tag(
        key=db_tag.key,
        value=db_tag.value,
    )
    updated_tags: list[schemas.Tag] = _remove_duplicates(
        recording.tags + [tag]
    )

    return schemas.Recording(
        **{
            **recording.dict(),
            "tags": updated_tags,
        }
    )


async def add_feature_to_recording(
    session: AsyncSession,
    feature: schemas.Feature,
    recording: schemas.Recording,
) -> schemas.Recording:
    """Add a feature to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    feature : schemas.features.Feature
        The feature to add.
    recording : schemas.recordings.Recording
        The recording to add the feature to.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists.

    """
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()

    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    # Check if the feature name already exists
    query = select(models.FeatureName).where(
        models.FeatureName.name == feature.name
    )
    result = await session.execute(query)
    db_feature = result.scalar_one_or_none()

    if db_feature is None:
        # Create the feature name if it does not exist
        db_feature = models.FeatureName(name=feature.name)
        session.add(db_feature)
        await session.commit()

    try:
        recording_feature = models.RecordingFeature(
            recording_id=db_recording.id,
            feature_name_id=db_feature.id,
            value=feature.value,
        )
        session.add(recording_feature)
        await session.commit()
    except IntegrityError:
        # This feature already exists for this recording
        await session.rollback()
        return recording

    feature = schemas.Feature(
        name=db_feature.name,
        value=recording_feature.value,
    )
    updated_features: list[schemas.Feature] = _remove_duplicates(
        recording.features + [feature]
    )

    return schemas.Recording(
        **{
            **recording.dict(),
            "features": updated_features,
        }
    )


async def remove_note_from_recording(
    session: AsyncSession,
    note: schemas.Note,
    recording: schemas.Recording,
):
    """Remove a note from a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    note : schemas.notes.Note
        The note to remove.
    recording : schemas.recordings.Recording
        The recording to remove the note from.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists or if no note with the
        given uuid exists.

    Note
    ----
    The note will only be removed from the recording if it exists,
    otherwise it will be ignored.
    """
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    query = select(models.Note).where(models.Note.uuid == note.uuid)
    result = await session.execute(query)
    db_note = result.scalar_one_or_none()
    if db_note is None:
        raise exceptions.NotFoundError("No note with the given uuid exists.")

    stmt = delete(models.RecordingNote).where(
        models.RecordingNote.recording_id == db_recording.id,
        models.RecordingNote.note_id == db_note.id,
    )
    await session.execute(stmt)
    await session.commit()

    return schemas.Recording(
        **{
            **recording.dict(),
            "notes": [
                note for note in recording.notes if note.uuid != db_note.uuid
            ],
        }
    )


async def remove_tag_from_recording(
    session: AsyncSession,
    tag: schemas.Tag,
    recording: schemas.Recording,
) -> schemas.Recording:
    """Remove a tag from a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    tag : schemas.tags.Tag
        The tag to remove.
    recording : schemas.recordings.Recording
        The recording to remove the tag from.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists or if no tag with the
        given key and value exists.

    Note
    ----
    The tag will only be removed from the recording if it exists,
    otherwise it will be ignored.
    """
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    query = select(models.Tag).where(
        models.Tag.key == tag.key,
        models.Tag.value == tag.value,
    )
    result = await session.execute(query)
    db_tag = result.scalar_one_or_none()
    if db_tag is None:
        raise exceptions.NotFoundError(
            "No tag with the given key and value exists."
        )

    stmt = delete(models.RecordingTag).where(
        models.RecordingTag.recording_id == db_recording.id,
        models.RecordingTag.tag_id == db_tag.id,
    )
    await session.execute(stmt)
    await session.commit()

    return schemas.Recording(
        **{
            **recording.dict(),
            "tags": [
                tag
                for tag in recording.tags
                if (tag.key != db_tag.key) or (tag.value != db_tag.value)
            ],
        }
    )


async def remove_feature_from_recording(
    session: AsyncSession,
    feature: schemas.Feature,
    recording: schemas.Recording,
):
    """Remove a feature from a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    feature : schemas.features.Feature
        The feature to remove.
    recording : schemas.recordings.Recording
        The recording to remove the feature from.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists or if no feature with the
        given name exists.

    Note
    ----
    The feature will only be removed from the recording if it exists,
    otherwise it will be ignored.
    """
    query = select(models.Recording).where(
        models.Recording.hash == recording.hash
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    query = select(models.FeatureName).where(
        models.FeatureName.name == feature.name
    )
    result = await session.execute(query)
    db_feature = result.scalar_one_or_none()
    if db_feature is None:
        raise exceptions.NotFoundError(
            "No feature with the given name exists."
        )

    stmt = delete(models.RecordingFeature).where(
        models.RecordingFeature.recording_id == db_recording.id,
        models.RecordingFeature.feature_name_id == db_feature.id,
    )
    await session.execute(stmt)
    await session.commit()

    return schemas.Recording(
        **{
            **recording.dict(),
            "features": [
                feature
                for feature in recording.features
                if (feature.name != db_feature.name)
            ],
        }
    )
