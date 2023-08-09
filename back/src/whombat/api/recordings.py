"""API functions for interacting with recordings."""

import datetime
from multiprocessing import Pool
from pathlib import Path

import sqlalchemy.orm as orm
from soundevent.data import Recording
from soundevent.audio import compute_md5_checksum
from sqlalchemy import Select, delete, insert, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.core import files
from whombat.core.common import remove_duplicates
from whombat.database import models
from whombat.filters.base import Filter
from whombat.schemas.recordings import RecordingCreate, RecordingUpdate

__all__ = [
    "add_feature_to_recording",
    "add_note_to_recording",
    "add_tag_to_recording",
    "create_recording",
    "delete_recording",
    "get_recording_by_hash",
    "get_recording_by_path",
    "get_recordings",
    "remove_feature_from_recording",
    "remove_note_from_recording",
    "remove_tag_from_recording",
    "update_recording",
    "update_recording_path",
]


async def create_recording(
    session: AsyncSession,
    path: Path,
    date: datetime.date | None = None,
    time: datetime.time | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    time_expansion: float = 1,
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
    time_expansion : float, optional
        The time expansion factor, by default 1. When target sound events
        are ultrasonic it is common to time expand the recording to make
        them audible.

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
        time_expansion=time_expansion,
    )

    recording = Recording.from_file(
        path,
        time_expansion=time_expansion,
        compute_hash=True,
    )

    hash = recording.hash
    duration = recording.duration
    channels = recording.channels
    samplerate = recording.samplerate

    try:
        recording = models.Recording(
            hash=hash,  # type: ignore
            path=str(path.absolute()),
            duration=duration,
            channels=channels,
            samplerate=samplerate,
            time_expansion=data.time_expansion,
            date=data.date,
            time=data.time,
            latitude=data.latitude,
            longitude=data.longitude,
        )
        session.add(recording)
        await session.commit()
    except IntegrityError:
        # TODO: Make this more specific
        await session.rollback()
        raise exceptions.DuplicateObjectError(
            "A recording with the given path or hash already exists."
        )

    return schemas.Recording(
        path=Path(recording.path),
        hash=recording.hash,
        duration=recording.duration,
        channels=recording.channels,
        samplerate=recording.samplerate,
        time_expansion=recording.time_expansion,
        date=recording.date,
        time=recording.time,
        latitude=recording.latitude,
        longitude=recording.longitude,
    )


async def create_recordings(
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
        file_info = pool.map(
            files.get_file_info,
            paths,
        )

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

    if not values:
        return []

    # Make bulk insert
    query = insert(models.Recording).values(values)
    await session.execute(query)
    await session.commit()

    return [
        schemas.Recording(
            path=Path(recording["path"]),
            hash=recording["hash"],
            duration=recording["duration"],
            channels=recording["channels"],
            samplerate=recording["samplerate"],
            time_expansion=recording["time_expansion"],
        )
        for recording in values
    ]


def _convert_recording_to_schema(
    recording: models.Recording,
) -> schemas.Recording:
    return schemas.Recording(
        path=Path(recording.path),
        hash=recording.hash,
        duration=recording.duration,
        channels=recording.channels,
        samplerate=recording.samplerate,
        time_expansion=recording.time_expansion,
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


def _add_associated_objects_to_recording(query: Select) -> Select:
    """Get the base query for retrieving recordings.

    Preloads all features, notes and tags.
    """
    return query.options(
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
    query = _add_associated_objects_to_recording(
        select(models.Recording)
    ).where(models.Recording.hash == hash)
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
    values = data.model_dump(exclude_none=True, exclude_unset=True)

    if data.time_expansion is not None:
        factor = data.time_expansion / recording.time_expansion
        values["duration"] = recording.duration / factor
        values["samplerate"] = recording.samplerate * factor

    stmt = (
        update(models.Recording)
        .where(models.Recording.hash == recording.hash)
        .values(**values)
    )
    await session.execute(stmt)
    await session.commit()
    return schemas.Recording(
        **{
            **recording.model_dump(),
            **values,
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
    query = _add_associated_objects_to_recording(select(models.Recording))

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
    updated_notes = remove_duplicates(recording.notes + [updated_note])
    return schemas.Recording(
        **{
            **recording.model_dump(),
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
    updated_tags: list[schemas.Tag] = remove_duplicates(recording.tags + [tag])

    return schemas.Recording(
        **{
            **recording.model_dump(),
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
    updated_features: list[schemas.Feature] = remove_duplicates(
        recording.features + [feature]
    )

    return schemas.Recording(
        **{
            **recording.model_dump(),
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
            **recording.model_dump(),
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
            **recording.model_dump(),
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
            **recording.model_dump(),
            "features": [
                feature
                for feature in recording.features
                if (feature.name != db_feature.name)
            ],
        }
    )


async def get_recording_by_path(
    session: AsyncSession,
    path: Path,
) -> schemas.Recording:
    """Get a recording by its path.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    path : Path
        The path of the recording to get.

    Returns
    -------
    recording : schemas.Recording
        The recording with the given path.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given path exists.

    Notes
    -----
    This function does not check if the hash of the
    recording matches the hash of the file at the given path.

    """
    query = _add_associated_objects_to_recording(
        select(models.Recording)
    ).where(models.Recording.path == str(path.absolute()))
    result = await session.execute(query)
    db_recording = result.unique().scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given path exists."
        )

    return _convert_recording_to_schema(db_recording)


async def update_recording_path(
    session: AsyncSession,
    recording: schemas.Recording,
    path: Path,
) -> schemas.Recording:
    """Change the path to the recording.

    Specially useful if the recording has moved place.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    recording : schemas.Recording
        The recording to update.
    path : Path
        The new path to the recording.

    Returns
    -------
    recording : schemas.Recording

    Raises
    ------
    ValueError
        If the given path is not an existing file on the file system.
        Or if the hash of the given path does not match the hash of the
        recording in the database.

    exceptions.NotFoundError
        If the provided recording does not exist in the database.

    """
    if not path.is_file():
        raise ValueError(
            f"The given path {path} does not exist on the file system."
        )

    hash = compute_md5_checksum(path)

    query = select(models.Recording).where(
        models.Recording.path == str(recording.path)
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "No recording with the given hash exists."
        )

    if not db_recording.hash == hash:
        raise ValueError(
            f"The hash of the given path {path} does not match the hash of "
            f"the recording in the database."
        )

    db_recording.path = str(path.absolute())
    await session.commit()
    return schemas.Recording(**{**recording.model_dump(), "path": str(path)})
