"""API functions for interacting with recordings."""

import datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import users
from whombat.core import files
from whombat.database import models
from whombat.schemas.recordings import RecordingCreate, RecordingUpdate


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
    return schemas.Recording.from_orm(recording)


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
    query = select(models.Recording).where(models.Recording.hash == hash)
    result = await session.execute(query)
    recording = result.scalar_one_or_none()

    if recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    return schemas.Recording.from_orm(recording)


async def get_recording_by_id(
    session: AsyncSession,
    id: int,
) -> schemas.Recording:
    """Get a recording by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    id : int
        The ID of the recording.

    Returns
    -------
    recording : schemas.recordings.Recording
        The requested recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given ID exists.

    """
    query = select(models.Recording).where(models.Recording.id == id)
    result = await session.execute(query)
    recording = result.scalar_one_or_none()

    if recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given ID exists."
        )

    return schemas.Recording.from_orm(recording)


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

    """
    data = RecordingUpdate(**kwargs)
    db_recording = await get_recording_by_hash(session, recording.hash)

    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_recording, field, value)

    await session.commit()
    return schemas.Recording.from_orm(db_recording)


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

    """
    db_recording = await get_recording_by_hash(session, recording.hash)
    await session.delete(db_recording)
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

    """
    db_recording = await get_recording_by_hash(session, recording.hash)




    return schemas.Recording.from_orm(db_recording)



async def add_recording_tag():
    pass


async def add_recording_feature():
    pass


async def delete_recording_note():
    pass


async def delete_recording_tag():
    pass


async def delete_recording_feature():
    pass


async def set_recording_tags():
    pass


async def set_recording_features():
    pass
