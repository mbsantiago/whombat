"""REST API routes for evaluation sets."""
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
    project: schemas.EvaluationSetCreate,
):
    """Create an evaluation set."""
    project = await api.evaluation_sets.create(session, project)
    await session.commit()
    return project


@evaluation_sets_router.get(
    "/detail/",
    response_model=schemas.EvaluationSet,
)
async def get_evaluation_set(
    session: Session,
    evaluation_set_id: int,
):
    """Get an evaluation set."""
    project = await api.evaluation_sets.get_by_id(session, evaluation_set_id)
    return project


@evaluation_sets_router.patch(
    "/detail/",
    response_model=schemas.EvaluationSet,
)
async def update_evaluation_set(
    session: Session,
    evaluation_set_id: int,
    data: schemas.EvaluationSetUpdate,
):
    """Update an evaluation set."""
    project = await api.evaluation_sets.update(
        session, evaluation_set_id, data
    )
    await session.commit()
    return project


@evaluation_sets_router.delete(
    "/detail/",
    response_model=schemas.EvaluationSet,
)
async def delete_evaluation_set(
    session: Session,
    evaluation_set_id: int,
):
    """Delete an evaluation set."""
    project = await api.evaluation_sets.delete(session, evaluation_set_id)
    await session.commit()
    return project


@evaluation_sets_router.post(
    "/detail/tags/",
    response_model=schemas.EvaluationSet,
)
async def add_tag_to_evaluation_set(
    session: Session,
    evaluation_set_id: int,
    tag_id: int,
):
    """Add a tag to an evaluation set."""
    project = await api.evaluation_sets.add_tag(
        session, evaluation_set_id, tag_id
    )
    await session.commit()
    return project


@evaluation_sets_router.delete(
    "/detail/tags/",
    response_model=schemas.EvaluationSet,
)
async def remove_tag_from_evaluation_set(
    session: Session,
    evaluation_set_id: int,
    tag_id: int,
):
    """Remove a tag from an evaluation set."""
    project = await api.evaluation_sets.remove_tag(
        session, evaluation_set_id, tag_id
    )
    await session.commit()
    return project
