"""REST API routes for model runs."""

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.model_runs import ModelRunFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "model_runs_router",
]


model_runs_router = APIRouter()


@model_runs_router.get("/", response_model=list[schemas.ModelRun])
async def get_model_runs(
    session: Session,
    limit: Limit = 100,
    offset: Offset = 0,
    filter: ModelRunFilter = Depends(ModelRunFilter),  # type: ignore
) -> schemas.Page[schemas.ModelRun]:
    """Get list of model runs."""
    model_runs, total = await api.model_runs.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
    )
    return schemas.Page(
        items=model_runs,
        total=total,
        offset=offset,
        limit=limit,
    )


@model_runs_router.post("/", response_model=schemas.ModelRun)
async def create_model_run(
    session: Session,
    model_run: schemas.ModelRunCreate,
) -> schemas.ModelRun:
    """Create model run."""
    return await api.model_runs.create(
        session,
        name=model_run.name,
        description=model_run.description,
        version=model_run.version,
    )
