"""REST API routes for datasets."""

import asyncio
import datetime
import logging
from fnmatch import fnmatchcase
from io import StringIO
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse
from soundevent.io.aoef import DatasetObject
from sqlalchemy.exc import IntegrityError

from whombat import api, exceptions, schemas
from whombat.core.files import is_within_root, resolve_within_root
from whombat.filters.datasets import DatasetFilter
from whombat.routes.dependencies import Session, WhombatSettings
from whombat.routes.types import Limit, Offset

__all__ = [
    "dataset_router",
]

dataset_router = APIRouter()

logger = logging.getLogger(__name__)


@dataset_router.get(
    "/browse/",
    response_model=schemas.DatasetDirectoryBrowse,
)
async def browse_dataset_directories(
    settings: WhombatSettings,
    path: str = "",
):
    """Browse directories within the configured audio directory."""
    try:
        result = await asyncio.to_thread(
            _browse_directories, settings.audio_dir, path
        )
    except (exceptions.PathOutsideRootError, OSError, RuntimeError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Unexpected dataset directory browse failure")
        raise HTTPException(
            status_code=500, detail="Could not browse dataset directories"
        ) from error
    if isinstance(result, str):
        raise HTTPException(status_code=400, detail=result)
    directory, root, directories = result

    relative_path = directory.relative_to(root).as_posix()
    if relative_path == ".":
        relative_path = ""
    parent = (
        directory.parent.relative_to(root).as_posix()
        if directory != root
        else None
    )
    if parent == ".":
        parent = ""
    return schemas.DatasetDirectoryBrowse(
        path=relative_path,
        absolute=str(directory),
        parent=parent,
        directories=directories,
    )


def _browse_directories(root: Path, path: str):
    root = root.expanduser().resolve()
    requested = Path(path).expanduser()
    candidate = requested if requested.is_absolute() else root / requested
    directory = resolve_within_root(candidate, root)
    if not directory.is_dir():
        return "Path is not an existing directory"
    directories = sorted(
        (
            schemas.DatasetDirectory(
                name=child.name,
                path=child.relative_to(root).as_posix(),
                absolute=str(child),
            )
            for child in directory.iterdir()
            if child.is_dir() and is_within_root(child, root)
        ),
        key=lambda child: child.name.casefold(),
    )
    return directory, root, directories


@dataset_router.get(
    "/detail/",
    response_model=schemas.Dataset,
)
async def get_dataset(
    session: Session,
    dataset_uuid: UUID,
):
    """Get a dataset by UUID."""
    return await api.datasets.get(session, dataset_uuid)


@dataset_router.get(
    "/",
    response_model=schemas.Page[schemas.Dataset],
)
async def get_datasets(
    session: Session,
    filter: Annotated[
        DatasetFilter,  # type: ignore
        Depends(DatasetFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
):
    """Get a page of datasets."""
    datasets, total = await api.datasets.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
    )

    return schemas.Page(
        items=datasets,
        total=total,
        offset=offset,
        limit=limit,
    )


@dataset_router.post(
    "/",
    response_model=schemas.DatasetCreated,
)
async def create_dataset(
    session: Session,
    dataset: schemas.DatasetCreate,
):
    """Create a new dataset."""
    stats: dict = {}
    try:
        created = await api.datasets.create(
            session,
            name=dataset.name,
            description=dataset.description,
            dataset_dir=dataset.audio_dir,
            tag_recordings_by_folder=dataset.tag_recordings_by_folder,
            include_subfolders=dataset.include_subfolders,
            stats=stats,
        )
    except exceptions.DuplicateObjectError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except IntegrityError as error:
        raise HTTPException(
            status_code=409, detail="Dataset name or directory already exists"
        ) from error
    except (ValueError, OSError) as error:
        logger.warning("Invalid dataset creation request: %s", error)
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Unexpected dataset creation failure")
        raise HTTPException(
            status_code=500, detail="Dataset creation failed"
        ) from error
    await session.commit()
    return schemas.DatasetCreated(dataset=created, **stats)


@dataset_router.patch(
    "/detail/",
    response_model=schemas.Dataset,
)
async def update_dataset(
    session: Session,
    dataset_uuid: UUID,
    data: schemas.DatasetUpdate,
):
    """Update a dataset."""
    dataset = await api.datasets.get(session, dataset_uuid)
    updated = await api.datasets.update(session, dataset, data)
    await session.commit()
    return updated


@dataset_router.get(
    "/detail/state/",
    response_model=list[schemas.DatasetFile],
)
async def get_file_state(
    session: Session,
    dataset_uuid: UUID,
):
    """Get the status of the files in a dataset."""
    dataset = await api.datasets.get(session, dataset_uuid)
    return await api.datasets.get_state(session, dataset)


@dataset_router.delete(
    "/detail/",
    response_model=schemas.Dataset,
)
async def delete_dataset(
    session: Session,
    dataset_uuid: UUID,
):
    """Delete a dataset."""
    dataset = await api.datasets.get(session, dataset_uuid)

    try:
        deleted = await api.datasets.delete(session, dataset)
    except IntegrityError as error:
        raise exceptions.DataIntegrityError(
            "Cannot delete this dataset because it is currently in use. "
            "This dataset may be associated with active annotation projects "
            "or other processes. Please ensure that the dataset is not being "
            "used in any active tasks before attempting to delete it."
        ) from error

    await session.commit()
    return deleted


@dataset_router.get(
    "/detail/download/json/",
    response_model=DatasetObject,
)
async def download_dataset_json(
    session: Session,
    dataset_uuid: UUID,
    settings: WhombatSettings,
):
    """Export a dataset."""
    whombat_dataset = await api.datasets.get(session, dataset_uuid)
    obj = await api.datasets.export_dataset(
        session,
        whombat_dataset,
        audio_dir=settings.audio_dir,
    )
    filename = f"{whombat_dataset.name}_{obj.created_on.isoformat()}.json"
    return Response(
        obj.model_dump_json(),
        media_type="application/json",
        status_code=200,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@dataset_router.get(
    "/complete/",
    response_model=list[schemas.DatasetDirectory],
)
async def complete_dataset_directories(
    settings: WhombatSettings,
    path: str = "",
):
    """Complete a partial directory path within the audio root."""
    normalized = path.replace("\\", "/")
    if normalized.endswith("/"):
        parent, prefix = normalized.rstrip("/"), ""
    else:
        parent, _, prefix = normalized.rpartition("/")

    try:
        result = await asyncio.to_thread(
            _browse_directories, settings.audio_dir, parent
        )
    except (exceptions.PathOutsideRootError, OSError, RuntimeError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Unexpected dataset directory completion failure")
        raise HTTPException(
            status_code=500, detail="Could not complete dataset directories"
        ) from error
    if isinstance(result, str):
        raise HTTPException(status_code=400, detail=result)

    _, _, directories = result
    prefix = prefix.casefold()
    return [
        directory
        for directory in directories
        if (
            fnmatchcase(directory.name.casefold(), prefix)
            if any(character in prefix for character in "*?")
            else directory.name.casefold().startswith(prefix)
        )
    ][:20]


@dataset_router.get(
    "/detail/download/csv/",
)
async def download_dataset_csv(
    session: Session,
    dataset_uuid: UUID,
):
    """Export the dataset recordings in csv format."""
    dataset = await api.datasets.get(session, dataset_uuid)
    df = await api.datasets.to_dataframe(session, dataset)
    buffer = StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    filename = f"{dataset.name}_{datetime.datetime.now()}.csv"
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        status_code=200,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@dataset_router.post(
    "/import/",
    response_model=schemas.Dataset,
)
async def import_dataset(
    settings: WhombatSettings,
    session: Session,
    dataset: UploadFile,
    audio_dir: Annotated[Path, Body()],
):
    """Import a dataset."""
    try:
        audio_dir = resolve_within_root(
            audio_dir.expanduser(),
            settings.audio_dir.expanduser(),
        )
    except (exceptions.PathOutsideRootError, OSError, RuntimeError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not audio_dir.is_dir():
        raise HTTPException(
            status_code=400,
            detail=f"Audio directory {audio_dir} does not exist.",
        )

    return await api.datasets.import_dataset(
        session,
        dataset.file,
        dataset_audio_dir=audio_dir,
        audio_dir=settings.audio_dir,
    )
