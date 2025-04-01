"""REST API routes for datasets."""

import datetime
import logging
from io import StringIO
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, UploadFile
from fastapi.responses import Response, StreamingResponse
from pydantic import DirectoryPath
from soundevent.io.aoef import DatasetObject
from sqlalchemy.exc import IntegrityError

from whombat import api, exceptions, schemas
from whombat.filters.datasets import DatasetFilter
from whombat.routes.dependencies import Session, WhombatSettings
from whombat.routes.types import Limit, Offset

__all__ = [
    "dataset_router",
]

dataset_router = APIRouter()

logger = logging.getLogger(__name__)


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
    response_model=schemas.Dataset,
)
async def create_dataset(
    session: Session,
    dataset: schemas.DatasetCreate,
):
    """Create a new dataset."""
    created = await api.datasets.create(
        session,
        name=dataset.name,
        description=dataset.description,
        dataset_dir=dataset.audio_dir,
    )
    await session.commit()
    return created


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
    audio_dir: Annotated[DirectoryPath, Body()],
):
    """Import a dataset."""
    if not audio_dir.exists():
        raise FileNotFoundError(f"Audio directory {audio_dir} does not exist.")

    return await api.datasets.import_dataset(
        session,
        dataset.file,
        dataset_audio_dir=audio_dir,
        audio_dir=settings.audio_dir,
    )
