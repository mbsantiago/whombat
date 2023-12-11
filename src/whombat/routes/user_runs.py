"""REST API routes for model runs."""
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile
from soundevent.io import aoef

from whombat import api, schemas
from whombat.dependencies import Session, ActiveUser
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


@user_runs_router.put("/detail/", response_model=schemas.UserRun)
async def update_user_run(
    session: Session,
    user_run_uuid: UUID,
    data: schemas.UserRunUpdate,
) -> schemas.UserRun:
    """Update model run."""
    user_run = await api.user_runs.get(session, user_run_uuid)
    user_run = await api.user_runs.update(
        session,
        user_run,
        data,
    )
    await session.commit()
    return user_run


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


@user_runs_router.get("/import//", response_model=schemas.UserRun)
async def import_user_run(
    session: Session,
    upload_file: UploadFile,
) -> schemas.UserRun:
    """Import model run."""
    obj = aoef.AOEFObject.model_validate_json(upload_file.file.read())
    data = aoef.to_soundevent(obj)
    user_run = await api.user_runs.from_soundevent(
        session,
        data,  # type: ignore
    )
    await session.commit()
    return user_run
