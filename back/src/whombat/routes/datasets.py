"""REST API routes for datasets."""

import datetime
import json
from io import StringIO
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, UploadFile
from fastapi.responses import Response, StreamingResponse
from pydantic import DirectoryPath
from soundevent.io.aoef import DatasetObject, to_aeof

from whombat import api, schemas
from whombat.api.io import aoef
from whombat.filters.datasets import DatasetFilter
from whombat.routes.dependencies import Session, WhombatSettings
from whombat.routes.types import Limit, Offset

__all__ = [
    "dataset_router",
]

dataset_router = APIRouter()


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
    limit: Limit = 10,
    offset: Offset = 0,
    filter: DatasetFilter = Depends(DatasetFilter),  # type: ignore
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
    deleted = await api.datasets.delete(session, dataset)
    await session.commit()
    return deleted


@dataset_router.get(
    "/detail/download/json/",
    response_model=DatasetObject,
)
async def download_dataset_json(
    session: Session,
    dataset_uuid: UUID,
):
    """Export a dataset."""
    whombat_dataset = await api.datasets.get(session, dataset_uuid)
    dataset = await api.datasets.to_soundevent(session, whombat_dataset)
    obj = to_aeof(dataset)
    filename = f"{dataset.name}_{obj.created_on.isoformat()}.json"
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

    obj = json.loads(dataset.file.read())
    db_dataset = await aoef.import_dataset(
        session,
        obj,
        dataset_dir=audio_dir,
        audio_dir=settings.audio_dir,
    )
    await session.commit()
    await session.refresh(db_dataset)
    return schemas.Dataset.model_validate(db_dataset)
