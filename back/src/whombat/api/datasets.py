"""API functions for interacting with datasets."""
import uuid
from pathlib import Path

from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import common, recordings
from whombat.core import files
from whombat.database import models
from whombat.filters.base import Filter
from whombat.schemas.datasets import DatasetCreate, DatasetUpdate

__all__ = [
    "add_file_to_dataset",
    "add_recording_to_dataset",
    "create_dataset",
    "delete_dataset",
    "get_dataset_by_id",
    "get_dataset_by_audio_dir",
    "get_dataset_by_name",
    "get_dataset_by_uuid",
    "get_dataset_state",
    "get_datasets",
    "update_dataset",
]


async def get_dataset_by_id(
    session: AsyncSession,
    dataset_id: int,
) -> schemas.Dataset:
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
    return schemas.Dataset.model_validate(dataset)


async def get_dataset_by_name(
    session: AsyncSession,
    name: str,
) -> schemas.Dataset:
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
    return schemas.Dataset.model_validate(dataset)


async def get_dataset_by_uuid(
    session: AsyncSession,
    uuid: uuid.UUID,
) -> schemas.Dataset:
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
    return schemas.Dataset.model_validate(dataset)


async def get_dataset_by_audio_dir(
    session: AsyncSession,
    audio_dir: Path,
) -> schemas.Dataset:
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
    return schemas.Dataset.model_validate(dataset)


async def get_datasets(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> list[schemas.Dataset]:
    """Get all datasets.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    limit : int, optional
        The maximum number of datasets to return, by default 100
    offset : int, optional
        The number of datasets to skip, by default 0

    Returns
    -------
    datasets : list[schemas.Dataset]

    """
    datasets = await common.get_objects(
        session,
        models.Dataset,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [schemas.Dataset.model_validate(dataset) for dataset in datasets]


async def create_dataset(
    session: AsyncSession,
    data: DatasetCreate,
) -> tuple[schemas.Dataset, list[schemas.DatasetRecording]]:
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
    db_dataset = await common.create_object(
        session,
        models.Dataset,
        data,
    )
    dataset = schemas.Dataset.model_validate(db_dataset)

    file_list = files.get_audio_files_in_folder(data.audio_dir, relative=False)
    recording_list = await recordings.create_recordings(
        session,
        [schemas.RecordingCreate(path=file) for file in file_list],
    )

    dataset_recordigns = await add_recordings_to_dataset(
        session=session,
        dataset=dataset,
        recordings=recording_list,
    )

    return dataset, dataset_recordigns


async def update_dataset(
    session: AsyncSession,
    dataset_id: int,
    data: DatasetUpdate,
) -> schemas.Dataset:
    """Update a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    dataset_id : int
        The ID of the dataset to update.

    data : DatasetUpdate
        The data to update the dataset with.

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given UUID exists.

    """
    db_dataset = await common.update_object(
        session,
        models.Dataset,
        models.Dataset.id == dataset_id,
        data,
    )
    return schemas.Dataset.model_validate(db_dataset)


async def delete_dataset(
    session: AsyncSession,
    dataset_id: int,
) -> None:
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
    await common.delete_object(
        session,
        models.Dataset,
        models.Dataset.id == dataset_id,
    )


async def add_file_to_dataset(
    session: AsyncSession,
    dataset_id: int,
    data: schemas.RecordingCreate,
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
    dataset = await get_dataset_by_id(session, dataset_id=dataset_id)

    # Make sure the file is part of the dataset audio dir
    if not data.path.is_relative_to(dataset.audio_dir):
        raise ValueError(
            "The file is not part of the dataset audio directory."
        )

    try:
        recording = await recordings.get_recording_by_path(session, data.path)
    except exceptions.NotFoundError:
        recording = await recordings.create_recording(session, data)

    return await add_recording_to_dataset(
        session,
        recording_id=recording.id,
        dataset_id=dataset_id,
    )


async def add_recording_to_dataset(
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
    dataset = await get_dataset_by_id(session, dataset_id=dataset_id)
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

    return schemas.DatasetRecording.model_validate(db_dataset_recording)


async def add_recordings_to_dataset(
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
            pass

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

    return [schemas.DatasetRecording.model_validate(x) for x in db_recordings]


async def get_dataset_recordings(
    session: AsyncSession,
    dataset_id: int,
    limit: int = 1000,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = None,
) -> list[schemas.DatasetRecording]:
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

    """
    dataset_recordings = await common.get_objects(
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
    ]


async def get_dataset_state(
    session: AsyncSession,
    dataset_id: int,
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

    Returns
    -------
    files : list[schemas.DatasetFile]

    """
    # Get the dataset.
    dataset = await get_dataset_by_id(session, dataset_id=dataset_id)

    # Get the files in the dataset directory.
    file_list = files.get_audio_files_in_folder(
        dataset.audio_dir, relative=True
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
