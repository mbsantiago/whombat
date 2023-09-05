"""API functions for interacting with recordings."""
import warnings
from functools import partial
from multiprocessing import Pool
from pathlib import Path

from cachetools import LRUCache
from soundevent.audio import compute_md5_checksum
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, filters, models, schemas
from whombat.api import common
from whombat.core import files
from whombat.core.common import remove_duplicates
from whombat.dependencies import get_settings

__all__ = [
    "add_feature",
    "add_note",
    "add_tag",
    "create",
    "delete",
    "get_recording_by_id",
    "get_by_hash",
    "get_by_path",
    "get_many",
    "remove_feature",
    "remove_note",
    "remove_tag",
    "update",
]


recording_caches = cache.CacheCollection(schemas.Recording)


@recording_caches.cached(
    name="recording_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, recording_id: recording_id,
    data_key=lambda recording: recording.id,
)
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
    recording = await common.get_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
    )
    return schemas.Recording.model_validate(recording)


@recording_caches.cached(
    name="recording_by_hash",
    cache=LRUCache(maxsize=1000),
    key=lambda _, recording_hash: recording_hash,
    data_key=lambda recording: recording.hash,
)
async def get_by_hash(
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
    recording = await common.get_object(
        session,
        models.Recording,
        models.Recording.hash == recording_hash,
    )
    return schemas.Recording.model_validate(recording)


@recording_caches.cached(
    name="recording_by_path",
    cache=LRUCache(maxsize=1000),
    key=lambda _, recording_path: recording_path,
    data_key=lambda recording: recording.path,
)
async def get_by_path(
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
    recording = await common.get_object(
        session,
        models.Recording,
        models.Recording.path == str(recording_path.absolute()),
    )
    return schemas.Recording.model_validate(recording)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: list[filters.Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.Recording], int]:
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

    sort_by : str, optional
        A string specifying how to sort the recordings, by default

    Returns
    -------
    recordings : list[schemas.recordings.Recording]
        The requested recordings.

    count : int
        The total number of recordings that match the given filters.

    """
    recordings, count = await common.get_objects(
        session,
        models.Recording,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.Recording.model_validate(recording) for recording in recordings
    ], count


def _assemble_recording_data(
    data: schemas.RecordingCreate,
    audio_dir: Path,
) -> schemas.RecordingPreCreate | None:
    """Get missing recording data from file."""
    info = files.get_file_info(data.path)

    if info.media_info is None:
        warnings.warn(
            f"Could not extract media info from file. {data.path}"
            "Skipping file.",
            UserWarning,
        )
        return None

    if not info.is_audio:
        warnings.warn(
            f"File is not an audio file. {data.path} Skipping file.",
            UserWarning,
        )
        return None

    if not data.path.is_relative_to(audio_dir):
        warnings.warn(
            f"File is not in audio directory. {data.path} Skipping file."
            f"Root audio directory: {audio_dir}",
            UserWarning,
        )
        return None

    duration = info.media_info.duration_s / data.time_expansion
    samplerate = info.media_info.samplerate_hz * data.time_expansion
    channels = info.media_info.channels
    return schemas.RecordingPreCreate(
        **{
            **data.model_dump(exclude_unset=True),
            "duration": duration,
            "samplerate": samplerate,
            "channels": channels,
            "hash": info.hash,
            "path": data.path.relative_to(audio_dir),
        }
    )


@recording_caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.RecordingCreate,
    audio_dir: Path | None = None,
) -> schemas.Recording:
    """Create a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data : schemas.RecordingCreate
        The data to create the recording with.

    audio_dir : Path
        The root directory for audio files. If not given, it will
        default to the value of `settings.audio_dir`.

    Returns
    -------
    recording : schemas.recordings.Recording
        The created recording.

    """
    if audio_dir is None:
        audio_dir = get_settings().audio_dir

    recording_data = _assemble_recording_data(data, audio_dir=audio_dir)

    if recording_data is None:
        raise ValueError("Cannot create recording from file.")

    recording = await common.create_object(
        session,
        models.Recording,
        recording_data,
    )
    return schemas.Recording.model_validate(recording)


async def create_many(
    session: AsyncSession,
    data: list[schemas.RecordingCreate],
    audio_dir: Path | None = None,
) -> list[schemas.Recording]:
    """Create recordings.

    If you want to create a single recording, use `create_recording`.
    However if you want to create multiple recordings, it is more efficient
    to use this function.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data: list[schemas.RecordingCreate]
        The data to create the recordings with.

    Returns
    -------
    recordings : list[schemas.recordings.Recording]
        The created recordings.

    Notes
    -----
    This function will only create recordings for files that:
    - are audio files (according to `files.is_audio_file`)
    - media info can be extracted from it.
    - do not already exist in the database.

    Any files that do not meet these criteria will be silently ignored.

    """
    if audio_dir is None:
        audio_dir = get_settings().audio_dir

    data = remove_duplicates(
        [recording for recording in data],
        key=lambda x: x.path,
    )

    with Pool() as pool:
        results = pool.map_async(
            partial(_assemble_recording_data, audio_dir=audio_dir),
            data,
        )
        # Take at most 50 milliseconds per file on average
        estimated_time = len(data) * 0.05
        all_data: list[schemas.RecordingPreCreate | None] = results.get(
            timeout=estimated_time
        )

    recordings = await common.create_objects_without_duplicates(
        session,
        models.Recording,
        [rec for rec in all_data if rec is not None],
        key=lambda recording: recording.hash,
        key_column=models.Recording.hash,
    )

    return [
        schemas.Recording.model_validate(recording) for recording in recordings
    ]


@recording_caches.with_update
async def update(
    session: AsyncSession,
    recording_id: int,
    data: schemas.RecordingUpdate,
    audio_dir: Path | None = None,
) -> schemas.Recording:
    """Update a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to update.

    data : RecordingUpdate
        The data to update the recording with.

    audio_dir : Path
        The root directory for audio files. If not given, it will
        default to the value of `settings.audio_dir`.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    """
    if audio_dir is None:
        audio_dir = get_settings().audio_dir

    recording = await common.get_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
    )

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "path":
            new_hash = compute_md5_checksum(value)

            if new_hash != recording.hash:
                raise ValueError(
                    "File at the given path does not match the hash of the "
                    "recording."
                )

            if not value.is_relative_to(audio_dir):
                raise ValueError(
                    "File is not in audio directory. "
                    f"\n\tFile:                 {value}. "
                    f"\n\tRoot audio directory: {audio_dir}"
                )

            recording.path = value.relative_to(audio_dir)
            continue

        if field == "time_expansion":
            if value == recording.time_expansion:
                continue

            adjust_time_expansion(recording, value)
            continue

        setattr(recording, field, value)

    await session.flush()
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

    recording.time_expansion = time_expansion

    # TODO: Update time and frequency coordinates of associated objects:
    # - clips
    # - sound_events


@recording_caches.with_clear
async def delete(
    session: AsyncSession,
    recording_id: int,
) -> schemas.Recording:
    """Delete a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to delete.

    Warning
    -------
    This will also delete all features, notes, tags and sound events
    associated with the recording. Use with caution.

    """
    obj = await common.delete_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
    )
    return schemas.Recording.model_validate(obj)


@recording_caches.with_update
async def add_note(
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
    recording = await common.add_note_to_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
        note_id,
    )
    return schemas.Recording.model_validate(recording)


@recording_caches.with_update
async def add_tag(
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
    recording = await common.add_tag_to_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
        tag_id,
    )

    return schemas.Recording.model_validate(recording)


@recording_caches.with_update
async def add_feature(
    session: AsyncSession,
    recording_id: int,
    feature_name_id: int,
    value: float,
) -> schemas.Recording:
    """Add a feature to a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to add the feature to.

    feature_name_id : int
        The ID of the feature name.

    value : float
        The value of the feature.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists.

    """
    recording = await common.add_feature_to_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
        feature_name_id,
        value,
    )
    return schemas.Recording.model_validate(recording)


@recording_caches.with_update
async def update_feature(
    session: AsyncSession,
    recording_id: int,
    feature_name_id: int,
    value: float,
) -> schemas.Recording:
    """Update a feature of a recording.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    recording_id : int
        The ID of the recording to update the feature of.

    feature_name_id : int
        The ID of the feature name.

    value : float
        The new value of the feature.

    Returns
    -------
    recording : schemas.recordings.Recording
        The updated recording.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no recording with the given hash exists.

    whombat.exceptions.NotFoundError
        If the recording does not have the given feature.

    """
    recording = await common.update_feature_on_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
        feature_name_id,
        value,
    )
    return schemas.Recording.model_validate(recording)


@recording_caches.with_update
async def remove_note(
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
    recording = await common.remove_note_from_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
        note_id,
    )
    return schemas.Recording.model_validate(recording)


@recording_caches.with_update
async def remove_tag(
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
    recording = await common.remove_tag_from_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
        tag_id,
    )
    return schemas.Recording.model_validate(recording)


@recording_caches.with_update
async def remove_feature(
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
    recording = await common.remove_feature_from_object(
        session,
        models.Recording,
        models.Recording.id == recording_id,
        feature_name_id,
    )
    return schemas.Recording.model_validate(recording)
