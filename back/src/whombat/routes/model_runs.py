"""REST API routes for model runs."""
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile
from soundevent.io import aoef

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


@model_runs_router.get("/detail/", response_model=schemas.ModelRun)
async def get_model_run(
    session: Session,
    model_run_uuid: UUID,
) -> schemas.ModelRun:
    """Get model run."""
    return await api.model_runs.get(session, model_run_uuid)


@model_runs_router.put("/detail/", response_model=schemas.ModelRun)
async def update_model_run(
    session: Session,
    model_run_uuid: UUID,
    data: schemas.ModelRunUpdate,
) -> schemas.ModelRun:
    """Update model run."""
    model_run = await api.model_runs.get(session, model_run_uuid)
    model_run = await api.model_runs.update(
        session,
        model_run,
        data,
    )
    await session.commit()
    return model_run


@model_runs_router.delete("/detail/", response_model=schemas.ModelRun)
async def delete_model_run(
    session: Session,
    model_run_uuid: UUID,
) -> schemas.ModelRun:
    """Delete model run."""
    model_run = await api.model_runs.get(session, model_run_uuid)
    await api.model_runs.delete(session, model_run)
    await session.commit()
    return model_run


@model_runs_router.get("/import/", response_model=schemas.ModelRun)
async def import_model_run(
    session: Session,
    upload_file: UploadFile,
) -> schemas.ModelRun:
    """Import model run."""
    obj = aoef.AOEFObject.model_validate_json(upload_file.file.read())
    data = aoef.to_soundevent(obj)
    model_run = await api.model_runs.from_soundevent(
        session,
        data,  # type: ignore
    )
    await session.commit()
    return model_run
