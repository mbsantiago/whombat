"""API functions for interacting with datasets."""
import logging
import uuid
from pathlib import Path

from cachetools import LRUCache
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import common, recordings
from whombat.core import files
from whombat.dependencies import get_settings
from whombat.filters.base import Filter
from whombat.schemas.datasets import DatasetCreate, DatasetUpdate

__all__ = [
    "add_file",
    "add_recording",
    "create",
    "delete",
    "get_many",
    "get_by_id",
    "get_by_audio_dir",
    "get_by_name",
    "get_by_uuid",
    "get_state",
    "get_recordings",
    "update",
]


logger = logging.getLogger(__name__)

dataset_caches = cache.CacheCollection(schemas.DatasetWithCounts)


@dataset_caches.cached(
    name="dataset_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, dataset_id: dataset_id,
    data_key=lambda dataset: dataset.id,
)
async def get_by_id(
    session: AsyncSession,
    dataset_id: int,
) -> schemas.DatasetWithCounts:
    """Get a dataset by ID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    dataset_id : int
        The ID of the dataset to get.

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given ID exists.

    """
    dataset = await common.get_object(
        session,
        models.Dataset,
        models.Dataset.id == dataset_id,
    )
    return schemas.DatasetWithCounts.model_validate(dataset)


@dataset_caches.cached(
    name="dataset_by_name",
    cache=LRUCache(maxsize=1000),
    key=lambda _, name: name,
    data_key=lambda dataset: dataset.name,
)
async def get_by_name(
    session: AsyncSession,
    name: str,
) -> schemas.DatasetWithCounts:
    """Get a dataset by name.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    name : str
        The name of the dataset to get.

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given name exists.

    """
    dataset = await common.get_object(
        session,
        models.Dataset,
        models.Dataset.name == name,
    )
    return schemas.DatasetWithCounts.model_validate(dataset)


@dataset_caches.cached(
    name="dataset_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, uuid: uuid,
    data_key=lambda dataset: dataset.uuid,
)
async def get_by_uuid(
    session: AsyncSession,
    uuid: uuid.UUID,
) -> schemas.DatasetWithCounts:
    """Get a dataset by UUID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    uuid : uuid.UUID
        The UUID of the dataset to get.

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given UUID exists.

    """
    dataset = await common.get_object(
        session,
        models.Dataset,
        models.Dataset.uuid == uuid,
    )
    return schemas.DatasetWithCounts.model_validate(dataset)


@dataset_caches.cached(
    name="dataset_by_audio_dir",
    cache=LRUCache(maxsize=1000),
    key=lambda _, audio_dir: audio_dir,
    data_key=lambda dataset: dataset.audio_dir,
)
async def get_by_audio_dir(
    session: AsyncSession,
    audio_dir: Path,
) -> schemas.DatasetWithCounts:
    """Get a dataset by audio directory.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    audio_dir : Path
        The audio directory of the dataset to get.

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given audio directory exists.

    """
    dataset = await common.get_object(
        session,
        models.Dataset,
        models.Dataset.audio_dir == audio_dir,
    )
    return schemas.DatasetWithCounts.model_validate(dataset)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.DatasetWithCounts], int]:
    """Get all datasets.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    limit : int, optional
        The maximum number of datasets to return, by default 100

    offset : int, optional
        The number of datasets to skip, by default 0

    filters : list[Filter], optional
        A list of filters to apply to the query, by default None.

    sort_by : str, optional
        The column to sort the datasets by, by default None.

    Returns
    -------
    datasets : list[schemas.Dataset]

    """
    datasets, count = await common.get_objects(
        session,
        models.Dataset,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.DatasetWithCounts.model_validate(dataset)
        for dataset in datasets
    ], count


async def create(
    session: AsyncSession,
    data: DatasetCreate,
    audio_dir: Path | None = None,
) -> tuple[schemas.DatasetWithCounts, list[schemas.DatasetRecording]]:
    """Create a dataset.

    This function will create a dataset and populate it with the audio files
    found in the given directory. It will look recursively for audio files
    within the directory.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data : DatasetCreate
        The data to use to create the dataset.

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    ValueError
        If a dataset with the given name or audio directory already exists.
    pydantic.ValidationError
        If the given audio directory does not exist.

    """
    if audio_dir is None:
        audio_dir = get_settings().audio_dir

    # Make sure the path is relative to the root audio directory.
    if not data.audio_dir.is_relative_to(audio_dir):
        raise ValueError(
            "The audio directory must be relative to the root audio directory."
            f"\n\tRoot audio directory: {audio_dir}"
            f"\n\tAudio directory: {data.audio_dir}"
        )

    db_dataset = await common.create_object(
        session,
        models.Dataset,
        data,
        audio_dir=data.audio_dir.relative_to(audio_dir),
    )
    dataset = schemas.Dataset.model_validate(db_dataset)

    file_list = files.get_audio_files_in_folder(
        audio_dir / data.audio_dir,
        relative=False,
    )

    logger.debug(f"Found {len(file_list)} audio files in {data.audio_dir}.")
    logger.debug(f"Creating recordings for {len(file_list)} audio files.")

    recording_list = await recordings.create_many(
        session,
        [schemas.RecordingCreate(path=file) for file in file_list],
        audio_dir=audio_dir,
    )

    logger.debug(f"Adding {len(recording_list)} recordings to dataset.")

    dataset_recordigns = await add_recordings(
        session=session,
        dataset=dataset,
        recordings=recording_list,
    )

    await session.refresh(db_dataset)

    dataset = schemas.DatasetWithCounts.model_validate(db_dataset)

    # Update the caches.
    dataset_caches.update_object(dataset)

    return (
        dataset,
        dataset_recordigns,
    )


@dataset_caches.with_update
async def update(
    session: AsyncSession,
    dataset_id: int,
    data: DatasetUpdate,
    audio_dir: Path | None = None,
) -> schemas.DatasetWithCounts:
    """Update a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset_id : int
        The ID of the dataset to update.

    data : DatasetUpdate
        The data to update the dataset with.

    audio_dir : Path, optional
        The root audio directory, by default None. If None, the root audio
        directory from the settings will be used.

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given UUID exists.

    """
    if audio_dir is None:
        audio_dir = get_settings().audio_dir

    dataset_audio_dir = None
    if data.audio_dir is not None:
        # Make sure the path is relative to the root audio directory.
        if not data.audio_dir.is_relative_to(audio_dir):
            raise ValueError(
                "The audio directory must be relative to the root audio "
                "directory."
                f"\n\tRoot audio directory: {audio_dir}"
                f"\n\tAudio directory: {data.audio_dir}"
            )

        dataset_audio_dir = data.audio_dir.relative_to(audio_dir)

    db_dataset = await common.update_object(
        session,
        models.Dataset,
        models.Dataset.id == dataset_id,
        data,
        audio_dir=dataset_audio_dir,
    )
    return schemas.DatasetWithCounts.model_validate(db_dataset)


@dataset_caches.with_clear
async def delete(
    session: AsyncSession,
    dataset_id: int,
) -> schemas.DatasetWithCounts:
    """Delete a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset_id : int
        The ID of the dataset to delete.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given id exists.

    """
    obj = await common.delete_object(
        session,
        models.Dataset,
        models.Dataset.id == dataset_id,
    )
    return schemas.DatasetWithCounts.model_validate(obj)


async def add_file(
    session: AsyncSession,
    dataset_id: int,
    data: schemas.RecordingCreate,
    audio_dir: Path | None = None,
) -> schemas.DatasetRecording:
    """Add a file to a dataset.

    This function adds a file to a dataset. The file is registered as a
    recording and is added to the dataset. If the file is already registered
    in the database, it is only added to the dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset_id : int
        The ID of the dataset to add the file to.

    data : schemas.RecordingCreate
        The data to create the recording with.


    audio_dir : Path, optional
        The root audio directory, by default None. If None, the root audio
        directory from the settings will be used.

    Returns
    -------
    recording : schemas.DatasetRecording
        The recording that was added to the dataset.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the file does not exist.

    ValueError
        If the file is not part of the dataset audio directory.

    """
    if audio_dir is None:
        audio_dir = get_settings().audio_dir

    dataset = await get_by_id(session, dataset_id=dataset_id)
    dataset_audio_dir = audio_dir / dataset.audio_dir

    # Make sure the file is part of the dataset audio dir
    if not data.path.is_relative_to(dataset_audio_dir):
        raise ValueError(
            "The file is not part of the dataset audio directory."
        )

    try:
        path = data.path.relative_to(audio_dir)
        recording = await recordings.get_by_path(session, path)
    except exceptions.NotFoundError:
        recording = await recordings.create(session, data, audio_dir=audio_dir)

    return await add_recording(
        session,
        recording_id=recording.id,
        dataset_id=dataset_id,
    )


async def add_recording(
    session: AsyncSession,
    dataset_id: int,
    recording_id: int,
) -> schemas.DatasetRecording:
    """Add a recording to a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset_id : int
        The ID of the dataset to add the recording to.

    recording_id : int
        The ID of the recording to add to the dataset.

    Returns
    -------
    dataset_recording : schemas.DatasetRecording
        The dataset recording that was created.

    Raises
    ------
    ValueError
        If the recording is not part of the dataset audio directory.

    """
    dataset = await get_by_id(session, dataset_id=dataset_id)
    recording = await recordings.get_recording_by_id(
        session, recording_id=recording_id
    )

    if not recording.path.is_relative_to(dataset.audio_dir):
        raise ValueError(
            "The recording is not part of the dataset audio directory."
        )

    data = schemas.DatasetRecordingCreate(
        dataset_id=dataset_id,
        recording_id=recording_id,
        path=recording.path.relative_to(dataset.audio_dir),
    )

    db_dataset_recording = await common.create_object(
        session,
        models.DatasetRecording,
        data,
    )

    # Update the dataset recording count.
    dataset.recording_count += 1
    dataset_caches.update_object(dataset)

    return schemas.DatasetRecording(
        dataset_id=db_dataset_recording.dataset_id,
        recording_id=db_dataset_recording.recording_id,
        path=db_dataset_recording.path,
        recording=schemas.RecordingWithoutPath.model_validate(recording),
    )


async def add_recordings(
    session: AsyncSession,
    dataset: schemas.Dataset,
    recordings: list[schemas.Recording],
) -> list[schemas.DatasetRecording]:
    """Add recordings to a dataset.

    Use this function to efficiently add multiple recordings to a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset : schemas.Dataset
        The dataset to add the recordings to.

    recordings: list[schemas.Recording]
        The recordings to add to the dataset.

    """
    data = []
    for recording in recordings:
        if not recording.path.is_relative_to(dataset.audio_dir):
            continue

        data.append(
            schemas.DatasetRecordingCreate(
                dataset_id=dataset.id,
                recording_id=recording.id,
                path=recording.path.relative_to(dataset.audio_dir),
            )
        )

    db_recordings = await common.create_objects_without_duplicates(
        session,
        models.DatasetRecording,
        data,
        key=lambda x: (x.dataset_id, x.recording_id),
        key_column=tuple_(
            models.DatasetRecording.dataset_id,
            models.DatasetRecording.recording_id,
        ),
    )

    # Remove the dataset from the cache as the recording count has changed.
    dataset_caches.clear_object(
        schemas.DatasetWithCounts.model_validate(dataset)
    )

    return [schemas.DatasetRecording.model_validate(x) for x in db_recordings]


async def get_recordings(
    session: AsyncSession,
    dataset_id: int,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = None,
) -> tuple[list[schemas.DatasetRecording], int]:
    """Get all recordings of a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset_id : int
        The ID of the dataset to get the recordings of.

    limit : int, optional
        The maximum number of recordings to return, by default 1000.
        If set to -1, all recordings will be returned.

    offset : int, optional
        The number of recordings to skip, by default 0.

    filters : list[Filter], optional
        A list of filters to apply to the query, by default None.

    sort_by : str, optional
        The column to sort the recordings by, by default None.

    Returns
    -------
    recordings : list[schemas.DatasetRecording]

    count : int
        The total number of recordings in the dataset.
    """
    # Get the dataset.
    await get_by_id(session, dataset_id=dataset_id)

    dataset_recordings, count = await common.get_objects(
        session,
        models.DatasetRecording,
        limit=limit,
        offset=offset,
        filters=[
            models.DatasetRecording.dataset_id == dataset_id,
            *(filters or []),
        ],
        sort_by=sort_by,
    )
    return [
        schemas.DatasetRecording.model_validate(x) for x in dataset_recordings
    ], count


async def get_state(
    session: AsyncSession,
    dataset_id: int,
    audio_dir: Path | None = None,
) -> list[schemas.DatasetFile]:
    """Compute the state of the dataset recordings.

    The dataset directory is scanned for audio files and compared to the
    registered dataset recordings in the database. The following states are
    possible:

    - ``missing``: A file is registered in the database and but is missing.

    - ``registered``: A file is registered in the database and is present.

    - ``unregistered``: A file is not registered in the database but is
        present in the dataset directory.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset_id : int
        The ID of the dataset to get the files for.

    audio_dir : Path, optional
        The root audio directory, by default None. If None, the root audio
        directory from the settings will be used.

    Returns
    -------
    files : list[schemas.DatasetFile]

    """
    if audio_dir is None:
        audio_dir = get_settings().audio_dir

    # Get the dataset.
    dataset = await get_by_id(session, dataset_id=dataset_id)

    # Get the files in the dataset directory.
    file_list = files.get_audio_files_in_folder(
        audio_dir / dataset.audio_dir,
        relative=True,
    )

    # Get the files in the database.
    query = (
        select(models.DatasetRecording.path)
        .join(models.Dataset)
        .where(models.Dataset.id == dataset.id)
    )
    result = await session.execute(query)
    db_recordings = result.scalars().all()
    db_files = [Path(path) for path in db_recordings]

    existing_files = set(file_list) & set(db_files)
    missing_files = set(db_files) - set(file_list)
    unregistered_files = set(file_list) - set(db_files)

    ret = []
    for path in existing_files:
        ret.append(
            schemas.DatasetFile(
                path=path,
                state=schemas.FileState.REGISTERED,
            )
        )

    for path in missing_files:
        ret.append(
            schemas.DatasetFile(
                path=path,
                state=schemas.FileState.MISSING,
            )
        )

    for path in unregistered_files:
        ret.append(
            schemas.DatasetFile(
                path=path,
                state=schemas.FileState.UNREGISTERED,
            )
        )

    return ret
