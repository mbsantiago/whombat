"""REST API routes for model runs."""

import json
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile

from whombat import api, schemas
from whombat.api.io import aoef
from whombat.filters.model_runs import ModelRunFilter
from whombat.routes.dependencies import Session, WhombatSettings
from whombat.routes.types import Limit, Offset

__all__ = [
    "model_runs_router",
]


model_runs_router = APIRouter()


@model_runs_router.get("/", response_model=schemas.Page[schemas.ModelRun])
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


@model_runs_router.post("/detail/evaluate/", response_model=schemas.Evaluation)
async def evaluate_model_run(
    session: Session,
    model_run_uuid: UUID,
    evaluation_set_uuid: UUID,
    settings: WhombatSettings,
) -> schemas.Evaluation:
    model_run = await api.model_runs.get(session, model_run_uuid)
    evaluation_set = await api.evaluation_sets.get(
        session, evaluation_set_uuid
    )
    evaluation = await api.evaluations.evaluate_model_run(
        session,
        model_run,
        evaluation_set,
        audio_dir=settings.audio_dir,
    )
    await session.commit()
    return evaluation


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


@model_runs_router.post("/import/", response_model=schemas.ModelRun)
async def import_model_run(
    session: Session,
    model_run: UploadFile,
    settings: WhombatSettings,
) -> schemas.ModelRun:
    """Import model run."""
    obj = json.loads(model_run.file.read())
    db_model_run = await aoef.import_model_run(
        session,
        obj,
        audio_dir=settings.audio_dir,
        base_audio_dir=settings.audio_dir,
    )
    await session.commit()
    await session.refresh(db_model_run)
    return schemas.ModelRun.model_validate(db_model_run)
