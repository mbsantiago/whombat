"""REST API routes for evaluation sets."""
from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.evaluation_sets import EvaluationSetFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "evaluation_sets_router",
]


evaluation_sets_router = APIRouter()


@evaluation_sets_router.get(
    "/",
    response_model=schemas.Page[schemas.EvaluationSet],
)
async def get_evaluation_sets(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: EvaluationSetFilter = Depends(EvaluationSetFilter),  # type: ignore
):
    """Get a page of evaluation sets."""
    projects, total = await api.evaluation_sets.get_many(
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


@evaluation_sets_router.post(
    "/",
    response_model=schemas.EvaluationSet,
)
async def create_evaluation_set(
    session: Session,
    data: schemas.EvaluationSetCreate,
):
    """Create an evaluation set."""
    evaluation_set = await api.evaluation_sets.create(
        session,
        name=data.name,
        description=data.description,
    )
    await session.commit()
    return evaluation_set


@evaluation_sets_router.get(
    "/detail/",
    response_model=schemas.EvaluationSet,
)
async def get_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
):
    """Get an evaluation set."""
    return await api.evaluation_sets.get(session, evaluation_set_uuid)


@evaluation_sets_router.patch(
    "/detail/",
    response_model=schemas.EvaluationSet,
)
async def update_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
    data: schemas.EvaluationSetUpdate,
):
    """Update an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    evaluation_set = await api.evaluation_sets.update(
        session,
        evaluation_set,
        data,
    )
    await session.commit()
    return evaluation_set


@evaluation_sets_router.delete(
    "/detail/",
    response_model=schemas.EvaluationSet,
)
async def delete_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
):
    """Delete an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    evaluation_set = await api.evaluation_sets.delete(session, evaluation_set)
    await session.commit()
    return evaluation_set


@evaluation_sets_router.post(
    "/detail/tags/",
    response_model=schemas.EvaluationSet,
)
async def add_tag_to_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
    key: str,
    value: str,
):
    """Add a tag to an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    evaluation_set = await api.evaluation_sets.add_tag(
        session,
        evaluation_set,
        tag,
    )
    await session.commit()
    return evaluation_set


@evaluation_sets_router.delete(
    "/detail/tags/",
    response_model=schemas.EvaluationSet,
)
async def remove_tag_from_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
    key: str,
    value: str,
):
    """Remove a tag from an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    evaluation_set = await api.evaluation_sets.remove_tag(
        session,
        evaluation_set,
        tag,
    )
    await session.commit()
    return evaluation_set
