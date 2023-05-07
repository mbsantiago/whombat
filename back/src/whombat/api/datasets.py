"""API functions for interacting with datasets."""
import uuid
from enum import Enum
from pathlib import Path

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.core import files
from whombat.database import models

__all__ = [
    "get_dataset_by_name",
    "get_dataset_by_uuid",
    "get_datasets",
    "create_dataset",
    "update_dataset",
    "delete_dataset",
    "get_dataset_files",
]


async def get_dataset_by_name(
    session: AsyncSession,
    name: str,
) -> schemas.datasets.Dataset:
    """Get a dataset by name.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    name : str
        The name of the dataset to get.

    Returns
    -------
    dataset : schemas.datasets.Dataset

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
    return schemas.datasets.Dataset.from_orm(dataset)


async def get_dataset_by_uuid(
    session: AsyncSession,
    uuid: uuid.UUID,
) -> schemas.datasets.Dataset:
    """Get a dataset by UUID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    uuid : uuid.UUID
        The UUID of the dataset to get.

    Returns
    -------
    dataset : schemas.datasets.Dataset

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
    return schemas.datasets.Dataset.from_orm(dataset)


async def get_dataset_by_audio_dir(
    session: AsyncSession,
    audio_dir: Path,
) -> schemas.datasets.Dataset:
    """Get a dataset by audio directory.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    audio_dir : Path
        The audio directory of the dataset to get.

    Returns
    -------
    dataset : schemas.datasets.Dataset

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
    return schemas.datasets.Dataset.from_orm(dataset)


async def get_datasets(
    session: AsyncSession,
    limit: int = 100,
    offset: int = 0,
) -> list[schemas.datasets.Dataset]:
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
    datasets : list[schemas.datasets.Dataset]

    """
    query = select(models.Dataset).limit(limit).offset(offset)
    result = await session.execute(query)
    datasets = result.scalars().all()
    return [schemas.datasets.Dataset.from_orm(dataset) for dataset in datasets]


async def create_dataset(
    session: AsyncSession,
    name: str,
    audio_dir: Path,
    description: str = "",
) -> schemas.datasets.Dataset:
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
    dataset : schemas.datasets.Dataset

    Raises
    ------
    ValueError
        If a dataset with the given name or audio directory already exists.
    pydantic.ValidationError
        If the given audio directory does not exist.

    """
    data = schemas.datasets.DatasetCreate(
        name=name,
        audio_dir=audio_dir,
        description=description,
    )
    db_dataset = models.Dataset(
        name=data.name,
        audio_dir=str(data.audio_dir),
        description=data.description,
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
    return schemas.datasets.Dataset.from_orm(db_dataset)


async def update_dataset(
    session: AsyncSession,
    dataset: schemas.datasets.Dataset,
    name: str | None = None,
    audio_dir: Path | None = None,
    description: str | None = None,
) -> schemas.datasets.Dataset:
    """Update a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    dataset : schemas.datasets.Dataset
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
    dataset : schemas.datasets.Dataset

    Raises
    ------
    whombat.exceptions.NotFoundError
        If no dataset with the given UUID exists.

    """
    data = schemas.datasets.DatasetUpdate(
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
    return schemas.datasets.Dataset.from_orm(db_dataset)


async def delete_dataset(
    session: AsyncSession,
    dataset: schemas.datasets.Dataset,
) -> None:
    """Delete a dataset.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    dataset : schemas.datasets.Dataset
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


class FileState(Enum):
    """The state of a file in a dataset.

    Datasets can contain files that are not registered in the database. This
    can happen if the file was added to the dataset directory after the
    dataset was registered. Additionally, files can be registered in the
    database but missing from the dataset directory. This can happen if the
    file was removed from the dataset directory after the dataset was
    registered.

    The state of a file can be one of the following:

    - ``missing``: The file is not registered in the database and is missing.

    - ``registered``: The file is registered in the database and is present.

    - ``unregistered``: The file is not registered in the database but is
        present in the dataset directory.
    """

    MISSING = "missing"
    """If the recording is registered but the file is missing."""

    REGISTERED = "registered"
    """If the recording is registered and the file is present."""

    UNREGISTERED = "unregistered"
    """If the recording is not registered but the file is present."""


class DatasetFileState(BaseModel):
    path: Path
    state: FileState


async def get_dataset_files(
    session: AsyncSession,
    dataset: schemas.datasets.Dataset,
) -> list[DatasetFileState]:
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
    dataset : schemas.datasets.Dataset
        The dataset to get the files of.

    Returns
    -------
    files : list[DatasetFileState]

    """
    # Get the files in the dataset directory.
    file_list = files.get_audio_files_in_folder(dataset.audio_dir)

    # Get the files in the database.
    query = (
        select(models.Recording.path)
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
        ret.append(DatasetFileState(path=path, state=FileState.REGISTERED))

    for path in missing_files:
        ret.append(DatasetFileState(path=path, state=FileState.MISSING))

    for path in unregistered_files:
        ret.append(DatasetFileState(path=path, state=FileState.UNREGISTERED))

    return ret
