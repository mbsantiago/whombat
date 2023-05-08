"""API functions for interacting with recordings."""

import datetime
from pathlib import Path
from typing import TypeVar

import sqlalchemy.orm as orm
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import notes, tags
from whombat.core import files
from whombat.database import models
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
    "set_features_for_recording",
    "set_tags_for_recording",
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
                models.RecordingFeature.feature
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
                name=feature.feature.name,
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
        .join(models.RecordingFeature)
        .join(models.RecordingNote)
        .join(models.RecordingTag)
        .limit(limit)
        .offset(offset)
    )
    result = await session.execute(query)
    return [
        schemas.Recording.from_orm(recording) for recording in result.scalars()
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
    recording: schemas.Recording,
    message: str,
    created_by: schemas.User,
    is_issue: bool = False,
) -> tuple[schemas.Recording, schemas.Note]:
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
    note : schemas.notes.Note
        The added note.

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

    db_note = models.Note(
        message=message,
        created_by_id=created_by.id,
        is_issue=is_issue,
    )
    session.add(db_note)
    recording_note = models.RecordingNote(
        recording=db_recording,
        note=db_note,
    )
    session.add(recording_note)
    await session.commit()

    note = schemas.Note(
        uuid=db_note.uuid,
        message=db_note.message,
        created_at=db_note.created_at,
        created_by=created_by.username,
        is_issue=db_note.is_issue,
    )
    updated_notes = _remove_duplicates(recording.notes + [note])
    return (
        schemas.Recording(
            **{
                **recording.dict(),
                "notes": updated_notes,
            }
        ),
        note,
    )


async def add_tag_to_recording(
    session: AsyncSession,
    recording: schemas.Recording,
    key: str,
    value: str,
) -> tuple[schemas.Recording, schemas.Tag]:
    """Add a tag to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    recording : schemas.recordings.Recording
        The recording to add the tag to.
    key : str
        The key of the tag.
    value : str
        The value of the tag.

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

    query = select(models.Tag).filter_by(key=key, value=value)
    result = await session.execute(query)
    db_tag = result.scalar_one_or_none()
    if db_tag is None:
        db_tag = models.Tag(key=key, value=value)
        session.add(db_tag)
        await session.commit()

    recording_tag = models.RecordingTag(
        recording_id=db_recording.id,
        tag_id=db_tag.id,
    )
    session.add(recording_tag)
    await session.commit()

    tag = schemas.Tag(
        key=db_tag.key,
        value=db_tag.value,
    )
    updated_tags: list[schemas.Tag] = _remove_duplicates(
        recording.tags + [tag]
    )

    return (
        schemas.Recording(
            **{
                **recording.dict(),
                "tags": updated_tags,
            }
        ),
        tag,
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

    recording_feature = models.RecordingFeature(
        recording_id=db_recording.id,
        feature_id=feature.id,
    )
    session.add(recording_feature)
    await session.commit()

    return schemas.Recording.from_orm(db_recording)


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

    stmt = (
        delete(models.RecordingNote)
        .where(models.RecordingNote.recording_id == db_recording.id)
        .where(models.RecordingNote.note_id == note.id)
    )
    await session.execute(stmt)
    await session.commit()

    return schemas.Recording.from_orm(db_recording)


async def remove_tag_from_recording():
    pass


async def remove_feature_from_recording():
    pass


async def set_tags_for_recording():
    pass


async def set_features_for_recording():
    pass
