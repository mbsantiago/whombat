"""REST API routes for evaluation sets."""

import json
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, UploadFile
from fastapi.responses import Response
from soundevent.io.aoef import to_aeof

from whombat import api, schemas
from whombat.api.io import aoef
from whombat.filters.evaluation_sets import EvaluationSetFilter
from whombat.routes.dependencies import Session, WhombatSettings
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


@evaluation_sets_router.post(
    "/detail/tasks/",
    response_model=schemas.EvaluationSet,
)
async def add_tasks_to_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
    annotation_task_uuids: list[UUID],
):
    """Add tasks to an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    evaluation = await api.evaluation_sets.add_annotation_tasks(
        session,
        evaluation_set,
        annotation_task_uuids,
    )
    await session.commit()
    return evaluation


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


@evaluation_sets_router.post(
    "/detail/model_runs/",
    response_model=schemas.EvaluationSet,
)
async def add_model_run_to_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
    model_run_uuid: UUID,
):
    """Add a model run to an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    model_run = await api.model_runs.get(session, model_run_uuid)
    evaluation_set = await api.evaluation_sets.add_model_run(
        session,
        evaluation_set,
        model_run,
    )
    await session.commit()
    return evaluation_set


@evaluation_sets_router.post(
    "/detail/user_runs/",
    response_model=schemas.EvaluationSet,
)
async def add_user_run_to_evaluation_set(
    session: Session,
    evaluation_set_uuid: UUID,
    user_run_uuid: UUID,
):
    """Add a user run to an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    user_run = await api.user_runs.get(session, user_run_uuid)
    evaluation_set = await api.evaluation_sets.add_user_run(
        session,
        evaluation_set,
        user_run,
    )
    await session.commit()
    return evaluation_set


@evaluation_sets_router.get(
    "/detail/download/",
)
async def download_evaluation_set(
    settings: WhombatSettings,
    session: Session,
    evaluation_set_uuid: UUID,
    exclude: list[str] | None = None,
):
    """Download an evaluation set."""
    evaluation_set = await api.evaluation_sets.get(
        session,
        evaluation_set_uuid,
    )
    soundevent_object = await api.evaluation_sets.to_soundevent(
        session,
        evaluation_set,
    )
    obj = to_aeof(soundevent_object, audio_dir=settings.audio_dir)
    filename = f"{evaluation_set.name}_{obj.created_on.isoformat()}.json"
    return Response(
        obj.model_dump_json(
            exclude=set(exclude or []),
            exclude_none=True,
        ),
        media_type="application/json",
        status_code=200,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@evaluation_sets_router.post(
    "/import/",
    response_model=schemas.EvaluationSet,
)
async def import_evaluation_set(
    settings: WhombatSettings,
    session: Session,
    evaluation_set: UploadFile,
    task: Annotated[str, Body()],
):
    """Import an annotation project."""
    obj = json.loads(evaluation_set.file.read())

    db_dataset = await aoef.import_evaluation_set(
        session,
        obj,
        audio_dir=settings.audio_dir,
        base_audio_dir=settings.audio_dir,
        task=task,
    )
    await session.commit()
    await session.refresh(db_dataset)
    return schemas.EvaluationSet.model_validate(db_dataset)
