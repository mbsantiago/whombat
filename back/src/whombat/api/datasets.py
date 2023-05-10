"""API functions for interacting with datasets."""
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import recordings
from whombat.core import files
from whombat.database import models
from whombat.schemas.datasets import DatasetCreate, DatasetUpdate

__all__ = [
    "add_file_to_dataset",
    "add_recording_to_dataset",
    "create_dataset",
    "create_empty_dataset",
    "delete_dataset",
    "get_dataset_by_audio_dir",
    "get_dataset_by_name",
    "get_dataset_by_uuid",
    "get_dataset_files",
    "get_datasets",
    "update_dataset",
]


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
    query = select(models.Dataset).where(models.Dataset.name == name)
    result = await session.execute(query)
    dataset = result.scalar_one_or_none()
    if dataset is None:
        raise exceptions.NotFoundError(
            "No dataset with the given name exists."
        )
    return schemas.Dataset.from_orm(dataset)


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
    query = select(models.Dataset).where(models.Dataset.uuid == uuid)
    result = await session.execute(query)
    dataset = result.scalar_one_or_none()
    if dataset is None:
        raise exceptions.NotFoundError(
            "No dataset with the given UUID exists."
        )
    return schemas.Dataset.from_orm(dataset)


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
    query = select(models.Dataset).where(
        models.Dataset.audio_dir == str(audio_dir)
    )
    result = await session.execute(query)
    dataset = result.scalar_one_or_none()
    if dataset is None:
        raise exceptions.NotFoundError(
            "No dataset with the given audio directory exists."
        )
    return schemas.Dataset.from_orm(dataset)


async def get_datasets(
    session: AsyncSession,
    limit: int = 100,
    offset: int = 0,
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
    query = select(models.Dataset).limit(limit).offset(offset)
    result = await session.execute(query)
    datasets = result.scalars().all()
    return [schemas.Dataset.from_orm(dataset) for dataset in datasets]


async def create_empty_dataset(
    session: AsyncSession,
    name: str,
    audio_dir: Path,
    description: str = "",
) -> schemas.Dataset:
    """Create a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    name : str
        The name of the dataset.
    audio_dir : Path
        The path to the directory containing the audio files.
    description : str, optional
        A description of the dataset, by default ""

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
    data = DatasetCreate(
        name=name,
        audio_dir=audio_dir,
        description=description,
    )

    db_dataset = models.Dataset(
        name=data.name,
        audio_dir=str(data.audio_dir),
        description=data.description,  # type: ignore
    )

    try:
        session.add(db_dataset)
        await session.flush()
    except IntegrityError as error:
        if "UNIQUE constraint failed" in str(error):
            if "dataset.name" in str(error):
                raise ValueError(
                    "A dataset with the given name already exists."
                )
            if "dataset.audio_dir" in str(error):
                raise ValueError(
                    "A dataset with the given audio directory already exists."
                )
        raise error
    return schemas.Dataset.from_orm(db_dataset)


async def update_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
    name: str | None = None,
    audio_dir: Path | None = None,
    description: str | None = None,
) -> schemas.Dataset:
    """Update a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    dataset : schemas.Dataset
        The dataset to update.
    name : str, optional
        The new name of the dataset, by default None
    audio_dir : Path, optional
        The new path to the directory containing the audio files, by default
        None
    description : str, optional
        The new description of the dataset, by default None

    Returns
    -------
    dataset : schemas.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given UUID exists.

    """
    data = DatasetUpdate(
        name=name,
        audio_dir=audio_dir,
        description=description,
    )

    query = select(models.Dataset).where(models.Dataset.uuid == dataset.uuid)
    result = await session.execute(query)
    db_dataset = result.scalar_one_or_none()
    if db_dataset is None:
        raise exceptions.NotFoundError(
            "No dataset with the given UUID exists."
        )
    if data.name is not None:
        db_dataset.name = data.name
    if data.audio_dir is not None:
        db_dataset.audio_dir = str(data.audio_dir)
    if data.description is not None:
        db_dataset.description = data.description
    await session.flush()
    return schemas.Dataset.from_orm(db_dataset)


async def delete_dataset(
    session: AsyncSession,
    dataset: schemas.Dataset,
) -> None:
    """Delete a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    dataset : schemas.Dataset
        The dataset to delete.

    Raises
    ------
    sqlalchemy.exc.NoResultFound
        If no dataset with the given UUID exists.

    """
    query = select(models.Dataset).where(models.Dataset.uuid == dataset.uuid)
    result = await session.execute(query)
    db_dataset = result.scalar_one_or_none()
    if db_dataset is None:
        raise NoResultFound
    await session.delete(db_dataset)
    await session.flush()


async def get_dataset_files(
    session: AsyncSession,
    dataset: schemas.Dataset,
) -> list[schemas.DatasetFile]:
    """Get the files in a dataset.

    When a dataset is created, the files in the dataset directory are
    registered in the database. This function returns the files in the
    dataset directory and their state. The state can be one of the following:

    - ``missing``: The file is registered in the database and but is missing.

    - ``registered``: The file is registered in the database and is present.

    - ``unregistered``: The file is not registered in the database but is
        present in the dataset directory.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    dataset : schemas.Dataset
        The dataset to get the files of.

    Returns
    -------
    files : list[schemas.DatasetFile]

    """
    # Get the files in the dataset directory.
    file_list = files.get_audio_files_in_folder(dataset.audio_dir)

    # Get the files in the database.
    query = (
        select(models.DatasetRecording.path)
        .join(models.Dataset)
        .where(models.Dataset.uuid == dataset.uuid)
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


async def add_file_to_dataset(
    session: AsyncSession,
    path: Path,
    dataset: schemas.Dataset,
    **kwargs,
) -> schemas.Recording:
    """Add a file to a dataset.

    This function adds a file to a dataset. The file is registered as a
    recording and is added to the dataset. If the file is already registered
    in the database, it is only added to the dataset.

    You can pass additional keyword arguments to the recording. These are
    passed the the `create_recording` function and are used to set
    some of the recording's metadata.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    path : Path
        Path to the file to add.
    dataset : schemas.Dataset
        The dataset to add the file to.

    Returns
    -------
    recording : schemas.Recording
        The recording that was added to the dataset.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the file does not exist.

    ValueError
        If the file is not part of the dataset audio directory.

    """
    # Make sure the file is part of the dataset audio dir
    if not path.is_relative_to(dataset.audio_dir):
        raise ValueError(
            "The file is not part of the dataset audio directory."
        )

    try:
        recording = await recordings.get_recording_by_path(session, path)
    except exceptions.NotFoundError:
        recording = await recordings.create_recording(session, path, **kwargs)

    await add_recording_to_dataset(
        session,
        recording,
        dataset,
    )

    return recording


async def add_recording_to_dataset(
    session: AsyncSession,
    recording: schemas.Recording,
    dataset: schemas.Dataset,
) -> Path:
    """Add a recording to a dataset.

    This function adds a recording to a dataset. The recording is added to
    the dataset. If the recording is already registered in the database, it
    is only added to the dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    recording : schemas.Recording
        The recording to add.
    dataset : schemas.Dataset
        The dataset to add the recording to.

    Returns
    -------
    relative_path : Path
        The relative path of the recording in the dataset audio directory.

    Raises
    ------
    ValueError
        If the recording is not part of the dataset audio directory.

    exceptions.NotFoundError
        If the recording is not registered in the database.

    Notes
    -----
    If the recording is already part of the dataset, this function does
    nothing.

    """
    if not recording.path.is_relative_to(dataset.audio_dir):
        raise ValueError(
            "The recording is not part of the dataset audio directory."
        )

    query = select(models.Recording).where(
        models.Recording.path == str(recording.path)
    )
    result = await session.execute(query)
    db_recording = result.scalar_one_or_none()
    if db_recording is None:
        raise exceptions.NotFoundError(
            "The recording is not registered in the database."
        )

    query = select(models.Dataset).where(models.Dataset.uuid == dataset.uuid)
    result = await session.execute(query)
    db_dataset = result.scalar_one_or_none()
    if db_dataset is None:
        raise exceptions.NotFoundError(
            "The dataset is not registered in the database."
        )

    relative_path = recording.path.relative_to(dataset.audio_dir)

    try:
        db_dataset_recording = models.DatasetRecording(
            dataset_id=db_dataset.id,
            recording_id=db_recording.id,
            path=str(relative_path),
        )
        session.add(db_dataset_recording)
        await session.commit()
    except IntegrityError:
        await session.rollback()

    return relative_path


async def create_dataset(
    session: AsyncSession,
    name: str,
    audio_dir: Path,
    description: str = "",
) -> tuple[schemas.Dataset, list[schemas.Recording]]:
    """Create a dataset.

    This function will create a dataset and populate it with the audio files
    found in the given directory. It will look recursively for audio files
    within the directory.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    name : str
        The name of the dataset.
    audio_dir : Path
        The path to the directory containing the audio files.
    description : str, optional
        A description of the dataset, by default ""

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
    from tqdm import tqdm

    dataset = await create_empty_dataset(
        session=session,
        name=name,
        audio_dir=audio_dir,
        description=description,
    )

    file_list = files.get_audio_files_in_folder(audio_dir)
    recordings = [] 
    for path in tqdm(file_list):
        try:
            recording = await add_file_to_dataset(
                session=session,
                path=audio_dir / path,
                dataset=dataset,
            )
            recordings.append(recording)
        except exceptions.DuplicateObjectError:
            pass

    return dataset, recordings
