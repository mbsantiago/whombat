"""REST API routes for model runs."""
from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import ActiveUser, Session
from whombat.filters.user_runs import UserRunFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "user_runs_router",
]


user_runs_router = APIRouter()


@user_runs_router.get("/", response_model=list[schemas.UserRun])
async def get_user_runs(
    session: Session,
    limit: Limit = 100,
    offset: Offset = 0,
    filter: UserRunFilter = Depends(UserRunFilter),  # type: ignore
) -> schemas.Page[schemas.UserRun]:
    """Get list of model runs."""
    user_runs, total = await api.user_runs.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
    )
    return schemas.Page(
        items=user_runs,
        total=total,
        offset=offset,
        limit=limit,
    )


@user_runs_router.post("/", response_model=schemas.UserRun)
async def create_user_run(
    session: Session,
    user: ActiveUser,
) -> schemas.UserRun:
    """Create model run."""
    user_run = await api.user_runs.create(
        session,
        user=user,
    )
    await session.commit()
    return user_run


@user_runs_router.get("/detail/", response_model=schemas.UserRun)
async def get_user_run(
    session: Session,
    user_run_uuid: UUID,
) -> schemas.UserRun:
    """Get model run."""
    return await api.user_runs.get(session, user_run_uuid)


@user_runs_router.delete("/detail/", response_model=schemas.UserRun)
async def delete_user_run(
    session: Session,
    user_run_uuid: UUID,
) -> schemas.UserRun:
    """Delete model run."""
    user_run = await api.user_runs.get(session, user_run_uuid)
    await api.user_runs.delete(session, user_run)
    await session.commit()
    return user_run
