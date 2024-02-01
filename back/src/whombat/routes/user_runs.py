"""REST API routes for model runs."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.user_runs import UserRunFilter
from whombat.routes.dependencies import Session, get_current_user_dependency
from whombat.routes.dependencies.settings import WhombatSettings
from whombat.routes.types import Limit, Offset

__all__ = [
    "get_user_runs_router",
]


def get_user_runs_router(settings: WhombatSettings) -> APIRouter:
    """Get the API router for model runs."""

    active_user = get_current_user_dependency(settings)

    user_runs_router = APIRouter()

    @user_runs_router.get("/", response_model=schemas.Page[schemas.UserRun])
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
        user: schemas.SimpleUser = Depends(active_user),
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

    return user_runs_router
