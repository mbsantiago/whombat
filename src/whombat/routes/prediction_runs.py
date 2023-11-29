"""REST API routes for prediction runs."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.prediction_runs import PredictionRunFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "prediction_runs_router",
]


prediction_runs_router = APIRouter()


@prediction_runs_router.get(
    "/",
    response_model=schemas.Page[schemas.PredictionRun],
)
async def get_prediction_runs(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: PredictionRunFilter = Depends(PredictionRunFilter),  # type: ignore
):
    """Get a page of model runs."""
    projects, total = await api.prediction_runs.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
    )
    return schemas.Page(
        items=projects,
        total=total,
        limit=limit,
        offset=offset,
    )


@prediction_runs_router.post(
    "/",
    response_model=schemas.PredictionRun,
)
async def create_evaluation_set(
    session: Session,
    project: schemas.PredictionRunCreate,
):
    """Create a model run."""
    project = await api.prediction_runs.create(session, project)
    await session.commit()
    return project


@prediction_runs_router.get(
    "/detail/",
    response_model=schemas.PredictionRun,
)
async def get_evaluation_set(
    session: Session,
    evaluation_set_id: int,
):
    """Get a model run."""
    project = await api.prediction_runs.get_by_id(session, evaluation_set_id)
    return project


@prediction_runs_router.patch(
    "/detail/",
    response_model=schemas.PredictionRun,
)
async def update_evaluation_set(
    session: Session,
    evaluation_set_id: int,
    data: schemas.PredictionRunUpdate,
):
    """Update a model run."""
    project = await api.prediction_runs.update(
        session, evaluation_set_id, data
    )
    await session.commit()
    return project


@prediction_runs_router.delete(
    "/detail/",
    response_model=schemas.PredictionRun,
)
async def delete_evaluation_set(
    session: Session,
    evaluation_set_id: int,
):
    """Delete a model run."""
    project = await api.prediction_runs.delete(session, evaluation_set_id)
    await session.commit()
    return project


@prediction_runs_router.post(
    "/detail/evaluate/",
    response_model=schemas.PredictionRun,
)
async def evaluate_prediction_run(
    session: Session,
    prediction_run_id: int,
):
    """Evaluate a model run."""
    prediction_run = await api.prediction_runs.evaluate(
        session, prediction_run_id
    )
    await session.commit()
    return prediction_run


# TODO: Add endpoint to upload and download model run
