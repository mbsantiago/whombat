"""API functions for interacting with recordings."""

from uuid import uuid4
import datetime
from multiprocessing import Pool
from pathlib import Path

from soundevent.audio import compute_md5_checksum
from soundevent.data import Recording
from sqlalchemy import delete, insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql._typing import _ColumnExpressionArgument

from whombat import exceptions, filters, schemas
from whombat.core import files
from whombat.core.common import remove_duplicates
from whombat.database import models

__all__ = [
    "add_feature_to_recording",
    "add_note_to_recording",
    "add_tag_to_recording",
    "create_recording",
    "delete_recording",
    "get_recording_by_id",
    "get_recording_by_hash",
    "get_recording_by_path",
    "get_recordings",
    "remove_feature_from_recording",
    "remove_note_from_recording",
    "remove_tag_from_recording",
    "update_recording",
]


async def create_recording(
    session: AsyncSession,
    data: schemas.RecordingCreate,
) -> schemas.Recording:
    """Create a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    data : schemas.RecordingCreate
        The data to create the recording with.

    Returns
    -------
    recording : schemas.recordings.Recording
        The created recording.

    """
    recording = Recording.from_file(
        data.path,
        time_expansion=data.time_expansion,
        compute_hash=True,
    )
    assert recording.hash is not None

    try:
        recording = models.Recording(
            **{
                **data.model_dump(),
                "hash": recording.hash,
                "duration": recording.duration,
                "channels": recording.channels,
                "samplerate": recording.samplerate,
            }
        )
        session.add(recording)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise exceptions.DuplicateObjectError(
            "A recording with the given path or hash already exists."
        )

    return schemas.Recording.model_validate(recording)


async def create_recordings_from_paths(
    session: AsyncSession,
    paths: list[Path],
    time_expansion: float = 1,
) -> list[schemas.Recording]:
    """Create recordings.

    If you want to create a single recording, use `create_recording`.
    However if you want to create multiple recordings, it is more efficient
    to use this function.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    paths : list[Path]
        The paths to the recording files.

    time_expansion : float, optional
        The time expansion factor, by default 1. This will be
        applied to all recordings.

    Returns
    -------
    recordings : list[schemas.recordings.Recording]
        The created recordings.

    Notes
    -----
    This function will only create recordings for files that:
    - exist in the filesystem
    - are audio files (according to `files.is_audio_file`)
    - media info can be extracted from it.
    - do not already exist in the database.

    Any files that do not meet these criteria will be silently ignored.

    """
    paths = remove_duplicates(paths)

    with Pool() as pool:
        file_info: list[files.FileInfo] = pool.map(files.get_file_info, paths)

    # Need to make sure that the hashes are unique
    audio_files = remove_duplicates(
        [
            info
            for info in file_info
            if info.exists and info.is_audio and (info.media_info is not None)
        ],
        key=lambda x: x.hash,
    )

    # Get the hashes of the recordings that already exist
    hashes = [info.hash for info in audio_files]
    query = select(models.Recording.hash).where(
        models.Recording.hash.in_(hashes)
    )
    results = await session.execute(query)
    existing_hashes = {result for result in results.scalars()}

    # Use the current time as the created_at time for all recordings
    now = datetime.datetime.now()

    def _get_values_from_info(info: files.FileInfo):
        assert info.media_info is not None
        duration = info.media_info.duration_s / time_expansion
        samplerate = info.media_info.samplerate_hz * time_expansion
        return {
            "uuid": uuid4(),
            "hash": info.hash,
            "path": str(info.path.absolute()),
            "duration": duration,
            "channels": info.media_info.channels,
            "samplerate": samplerate,
            "created_at": now,
            "time_expansion": time_expansion,
        }

    # Create values for bulk insert of recordings that don't already exist
    values = [
        _get_values_from_info(info)
        for info in audio_files
        if info.hash not in existing_hashes
    ]

    if values:
        # Make bulk insert
        query = insert(models.Recording).values(values)
        await session.execute(query)
        await session.commit()

    all_hashes = [info.hash for info in audio_files if info.hash is not None]
    return await get_recordings(
        session,
        limit=-1,
        filters=[filters.recordings.HashFilter(isin=all_hashes)],
    )


async def _get_recording(
    session: AsyncSession,
    condition: _ColumnExpressionArgument,
) -> models.Recording:
    query = select(models.Recording).where(condition)
    result = await session.execute(query)
    recording = result.scalars().first()

    if recording is None:
        raise exceptions.NotFoundError(
            "A recording with the given condition does not exist."
        )

    return recording


async def get_recording_by_id(
    session: AsyncSession, recording_id: int
) -> schemas.Recording:
    """Get a recording by ID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording.

    Returns
    -------
    recording : schemas.recordings.Recording
        The recording.

    Raises
    ------
    NotFoundError
        If a recording with the given ID does not exist.

    """
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )
    return schemas.Recording.model_validate(recording)


async def get_recording_by_hash(
    session: AsyncSession, recording_hash: str
) -> schemas.Recording:
    """Get a recording by hash.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_hash : str
        The hash of the recording.

    Returns
    -------
    recording : schemas.recordings.Recording
        The recording.

    Raises
    ------
    NotFoundError
        If a recording with the given hash does not exist.

    """
    recording = await _get_recording(
        session, models.Recording.hash == recording_hash
    )
    return schemas.Recording.model_validate(recording)


async def get_recording_by_path(
    session: AsyncSession, recording_path: Path
) -> schemas.Recording:
    """Get a recording by path.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_path : str
        The path of the recording.

    Returns
    -------
    recording : schemas.recordings.Recording
        The recording.

    Raises
    ------
    NotFoundError
        If a recording with the given path does not exist.

    """
    recording = await _get_recording(
        session, models.Recording.path == recording_path
    )
    return schemas.Recording.model_validate(recording)


async def update_recording(
    session: AsyncSession,
    recording_id: int,
    data: schemas.RecordingUpdate,
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
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )

    if data.path is not None:
        new_hash = compute_md5_checksum(data.path)
        if new_hash != recording.hash:
            raise ValueError(
                "File at the given path does not match the hash of the "
                "recording."
            )

    if (
        data.time_expansion is not None
        and data.time_expansion != recording.time_expansion
    ):
        adjust_time_expansion(recording, data.time_expansion)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(recording, field, value)

    await session.commit()
    return schemas.Recording.model_validate(recording)


def adjust_time_expansion(
    recording: models.Recording,
    time_expansion: float,
) -> None:
    """Adjust the time expansion of a recording.

    When the time expansion of a recording is adjusted several associated
    entities must be updated to reflect the new time expansion. Firstly
    the duration and samplerate of the recording must be updated. Secondly,
    the time and frequency coordinates of all associated objects must be
    updated.

    Parameters
    ----------
    recording : models.Recording
        The recording to adjust.

    time_expansion : float
        The new time expansion.

    """
    # Adjustment should be relative to the current time expansion
    factor = time_expansion / recording.time_expansion

    # Update recording duration and samplerate
    recording.duration /= factor
    recording.samplerate = int(factor * recording.samplerate)

    # TODO: Update time and frequency coordinates of associated objects:
    # - clips
    # - sound_events


async def get_recordings(
    session: AsyncSession,
    limit: int = 1000,
    offset: int = 0,
    filters: list[filters.Filter] | None = None,
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

    filters : list[Filter], optional
        A list of filters to apply to the query, by default None

    Returns
    -------
    recordings : list[schemas.recordings.Recording]
        The requested recordings.

    """
    query = select(models.Recording)

    if filters is None:
        filters = []

    for filter in filters:
        query = filter.filter(query)

    query = query.limit(limit).offset(offset)
    result = await session.execute(query)
    recordings = result.unique().scalars().all()
    return [
        schemas.Recording.model_validate(recording) for recording in recordings
    ]


async def delete_recording(
    session: AsyncSession,
    recording_id: int,
) -> None:
    """Delete a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to delete.

    Note
    ----
    This will fail silently if the recording does not exist.

    Warning
    -------
    This will also delete all features, notes, tags and sound events
    associated with the recording. Use with caution.

    """
    stmt = delete(models.Recording).where(models.Recording.id == recording_id)
    await session.execute(stmt)
    await session.commit()


async def add_note_to_recording(
    session: AsyncSession,
    recording_id: int,
    note_id: int,
) -> schemas.Recording:
    """Add a note to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording.

    note_id : int
        The ID of the note.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    """
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )

    if any(note.id == note_id for note in recording.notes):
        return schemas.Recording.model_validate(recording)

    recording_note = models.RecordingNote(
        recording_id=recording_id,
        note_id=note_id,
    )
    session.add(recording_note)
    await session.commit()

    session.expire(recording)
    return await get_recording_by_id(session, recording_id)


async def add_tag_to_recording(
    session: AsyncSession,
    recording_id: int,
    tag_id: int,
) -> schemas.Recording:
    """Add a tag to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to add the tag to.

    tag_id : int
        The ID of the tag to add.

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
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )

    if any(rec_tag.id == tag_id for rec_tag in recording.tags):
        return schemas.Recording.model_validate(recording)

    recording_tag = models.RecordingTag(
        recording_id=recording.id,
        tag_id=tag_id,
    )
    session.add(recording_tag)
    await session.commit()

    session.expire(recording)
    return await get_recording_by_id(session, recording_id)


async def add_feature_to_recording(
    session: AsyncSession,
    recording_id: int,
    feature: schemas.Feature,
) -> schemas.Recording:
    """Add a feature to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to add the feature to.

    feature : schemas.features.Feature
        The feature to add.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists.

    """
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )

    if any(
        rec_feature.feature_name.id == feature.feature_name.id
        for rec_feature in recording.features
    ):
        return schemas.Recording.model_validate(recording)

    recording_feature = models.RecordingFeature(
        recording_id=recording_id,
        feature_name_id=feature.feature_name.id,
        value=feature.value,
    )
    session.add(recording_feature)
    await session.commit()

    session.expire(recording)
    return await get_recording_by_id(session, recording_id)


async def remove_note_from_recording(
    session: AsyncSession,
    recording_id: int,
    note_id: int,
):
    """Remove a note from a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to remove the note from.

    note_id : int
        The ID of the note to remove.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given id exists.

    Note
    ----
    The note will only be removed from the recording if it exists,
    otherwise it will be ignored.
    """
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )

    recording_note = next(
        (
            note
            for note in recording.recording_notes
            if note.note.id == note_id
        ),
        None,
    )
    if recording_note is None:
        return schemas.Recording.model_validate(recording)

    recording.recording_notes.remove(recording_note)
    await session.commit()

    session.expire(recording)
    return await get_recording_by_id(session, recording_id)


async def remove_tag_from_recording(
    session: AsyncSession,
    recording_id: int,
    tag_id: int,
) -> schemas.Recording:
    """Remove a tag from a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to remove the tag from.

    tag_id : int
        The ID of the tag to remove.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given id exists

    Note
    ----
    The tag will only be removed from the recording if it exists,
    otherwise it will be ignored.
    """
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )

    recording_tag = next(
        (tag for tag in recording.recording_tags if tag.tag.id == tag_id), None
    )
    if recording_tag is None:
        return schemas.Recording.model_validate(recording)

    recording.recording_tags.remove(recording_tag)
    await session.commit()

    session.expire(recording)
    return await get_recording_by_id(session, recording_id)


async def remove_feature_from_recording(
    session: AsyncSession,
    recording_id: int,
    feature_name_id: int,
):
    """Remove a feature from a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to remove the feature from.

    feature_name_id : int
        The ID of the feature to remove.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given id exists.

    Note
    ----
    The feature will only be removed from the recording if it exists,
    otherwise it will be ignored.
    """
    recording = await _get_recording(
        session, models.Recording.id == recording_id
    )

    recording_feature = next(
        (
            feature
            for feature in recording.features
            if feature.feature_name.id == feature_name_id
        ),
        None,
    )
    if recording_feature is None:
        return schemas.Recording.model_validate(recording)

    recording.features.remove(recording_feature)
    await session.commit()

    session.expire(recording)
    return await get_recording_by_id(session, recording_id)
