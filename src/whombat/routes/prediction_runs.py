# """REST API routes for prediction runs."""
# from fastapi import APIRouter, Depends
#
# from whombat import api, schemas
# from whombat.dependencies import Session
# from whombat.filters.model_runs import ModelRunFilter
# from whombat.routes.types import Limit, Offset
#
# __all__ = [
#     "model_runs_router",
# ]
#
#
# model_runs_router = APIRouter()
#
#
# @model_runs_router.get(
#     "/",
#     response_model=schemas.Page[schemas.ModelRun],
# )
# async def get_model_runs(
#     session: Session,
#     limit: Limit = 10,
#     offset: Offset = 0,
#     filter: ModelRunFilter = Depends(ModelRunFilter),  # type: ignore
# ):
#     """Get a page of model runs."""
#     projects, total = await api.model_runs.get_many(
#         session,
#         limit=limit,
#         offset=offset,
#         filters=[filter],
#     )
#     return schemas.Page(
#         items=projects,
#         total=total,
#         limit=limit,
#         offset=offset,
#     )
#
#
# @model_runs_router.post(
#     "/",
#     response_model=schemas.ModelRun,
# )
# async def create_evaluation_set(
#     session: Session,
#     project: schemas.ModelRunCreate,
# ):
#     """Create a model run."""
#     project = await api.model_runs.create(session, project)
#     await session.commit()
#     return project
#
#
# @model_runs_router.get(
#     "/detail/",
#     response_model=schemas.ModelRun,
# )
# async def get_evaluation_set(
#     session: Session,
#     evaluation_set_id: int,
# ):
#     """Get a model run."""
#     project = await api.model_runs.get_by_id(session, evaluation_set_id)
#     return project
#
#
# @model_runs_router.patch(
#     "/detail/",
#     response_model=schemas.ModelRun,
# )
# async def update_evaluation_set(
#     session: Session,
#     evaluation_set_id: int,
#     data: schemas.ModelRunUpdate,
# ):
#     """Update a model run."""
#     project = await api.model_runs.update(
#         session, evaluation_set_id, data
#     )
#     await session.commit()
#     return project
#
#
# @model_runs_router.delete(
#     "/detail/",
#     response_model=schemas.ModelRun,
# )
# async def delete_evaluation_set(
#     session: Session,
#     evaluation_set_id: int,
# ):
#     """Delete a model run."""
#     project = await api.model_runs.delete(session, evaluation_set_id)
#     await session.commit()
#     return project
#
#
# @model_runs_router.post(
#     "/detail/evaluate/",
#     response_model=schemas.ModelRun,
# )
# async def evaluate_model_run(
#     session: Session,
#     model_run_id: int,
# ):
#     """Evaluate a model run."""
#     model_run = await api.model_runs.evaluate(
#         session, model_run_id
#     )
#     await session.commit()
#     return model_run
#
#
# # TODO: Add endpoint to upload and download model run
