"""REST API routes for datasets."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.datasets import DatasetFilter
from whombat.routers.types import Limit, Offset

__all__ = [
    "dataset_router",
]

dataset_router = APIRouter()


@dataset_router.get(
    "/detail/",
    response_model=schemas.DatasetWithCounts,
)
async def get_dataset(
    session: Session,
    dataset_id: int,
):
    """Get a dataset by UUID."""
    dataset = await api.datasets.get_by_id(session, dataset_id)
    return dataset


@dataset_router.get(
    "/",
    response_model=schemas.Page[schemas.DatasetWithCounts],
)
async def get_datasets(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: DatasetFilter = Depends(DatasetFilter),  # type: ignore
):
    """Get a page of datasets."""
    datasets, total = await api.datasets.get_many(
        session, limit=limit, offset=offset, filters=[filter]
    )

    return schemas.Page(
        items=datasets,
        total=total,
        offset=offset,
        limit=limit,
    )


@dataset_router.post(
    "/",
    response_model=schemas.DatasetWithCounts,
)
async def create_dataset(
    session: Session,
    dataset: schemas.DatasetCreate,
):
    """Create a new dataset."""
    created, _ = await api.datasets.create(session, dataset)
    await session.commit()
    return created


@dataset_router.patch(
    "/detail/",
    response_model=schemas.DatasetWithCounts,
)
async def update_dataset(
    session: Session,
    dataset_id: int,
    dataset: schemas.DatasetUpdate,
):
    """Update a dataset."""
    updated = await api.datasets.update(session, dataset_id, dataset)
    await session.commit()
    return updated


@dataset_router.delete(
    "/detail/",
    response_model=schemas.DatasetWithCounts,
)
async def delete_dataset(
    session: Session,
    dataset_id: int,
):
    """Delete a dataset."""
    deleted = await api.datasets.delete(session, dataset_id)
    await session.commit()
    return deleted
