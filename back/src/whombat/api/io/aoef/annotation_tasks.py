import datetime
from uuid import UUID

from soundevent.io.aoef import AnnotationProjectObject
from soundevent.io.aoef.annotation_task import AnnotationTaskObject
from sqlalchemy import insert, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.common import create_objects_without_duplicates
from whombat.api.io.aoef.common import get_mapping


async def get_annotation_tasks(
    session: AsyncSession,
    obj: AnnotationProjectObject,
    clips: dict[UUID, int],
    annotation_projects: dict[UUID, int],
    users: dict[UUID, UUID],
    clip_annotations: dict[UUID, int],
) -> dict[UUID, int]:
    tasks = obj.tasks or []
    if not tasks:
        return {}

    obj_clip_annotations = obj.clip_annotations or []
    mapping = {a.clip: a.uuid for a in obj_clip_annotations}

    annotation_project_uuids = [obj.uuid] * len(tasks)
    return await import_annotation_task(
        session,
        tasks,
        annotation_project_uuids,
        clips=clips,
        annotation_projects=annotation_projects,
        users=users,
        clip_annotations=clip_annotations,
        clip_annotation_mapping=mapping,
    )


async def import_annotation_task(
    session: AsyncSession,
    annotation_tasks: list[AnnotationTaskObject],
    annotation_project_uuids: list[UUID],
    clips: dict[UUID, int],
    annotation_projects: dict[UUID, int],
    users: dict[UUID, UUID],
    clip_annotations: dict[UUID, int],
    clip_annotation_mapping: dict[UUID, UUID],
) -> dict[UUID, int]:
    if not annotation_tasks:
        return {}

    if len(annotation_tasks) != len(annotation_project_uuids):
        raise ValueError(
            "The number of annotation tasks and annotation project "
            "UUIDs must match"
        )

    mapping = await _create_annotation_tasks(
        session,
        annotation_tasks,
        annotation_project_uuids,
        clips=clips,
        annotation_projects=annotation_projects,
        clip_annotations=clip_annotations,
        clip_annotation_mapping=clip_annotation_mapping,
    )

    await _create_annotation_badges(session, annotation_tasks, mapping, users)

    return mapping


async def _create_annotation_tasks(
    session: AsyncSession,
    annotation_tasks: list[AnnotationTaskObject],
    annotation_project_uuids: list[UUID],
    clips: dict[UUID, int],
    annotation_projects: dict[UUID, int],
    clip_annotations: dict[UUID, int],
    clip_annotation_mapping: dict[UUID, UUID],
) -> dict[UUID, int]:
    # Get existing
    mapping = await get_mapping(
        session, {t.uuid for t in annotation_tasks}, models.AnnotationTask
    )

    missing = [
        (t, proj_uuid)
        for (t, proj_uuid) in zip(annotation_tasks, annotation_project_uuids)
        if t.uuid not in mapping
    ]
    if not missing:
        return mapping

    values = []
    for task, proj_uuid in missing:
        clip_db_id = clips.get(task.clip)

        if clip_db_id is None:
            # Omit annotation task if clip is missing
            continue

        clip_annotation_uuid = clip_annotation_mapping.get(task.clip)
        clip_annotation_db_id = None
        if clip_annotation_uuid is not None:
            clip_annotation_db_id = clip_annotations.get(clip_annotation_uuid)
            if clip_annotation_db_id is None:
                # Omit annotation task if clip annotation is missing
                continue

        proj_db_id = annotation_projects.get(proj_uuid)
        if proj_db_id is None:
            # Omit annotation task if annotation project is missing
            continue

        values.append(
            {
                "uuid": task.uuid,
                "annotation_project_id": proj_db_id,
                "clip_annotation_id": clip_annotation_db_id,
                "clip_id": clip_db_id,
                "created_on": task.created_on or datetime.datetime.utcnow(),
            }
        )

    if not values:
        return mapping

    stmt = insert(models.AnnotationTask).values(values)
    await session.execute(stmt)

    # Get the IDs of the newly created annotations.
    created = await get_mapping(
        session, {v["uuid"] for v in values}, models.AnnotationTask
    )
    mapping.update(created)

    return mapping


async def _create_annotation_badges(
    session: AsyncSession,
    annotation_tasks: list[AnnotationTaskObject],
    annotation_task_mapping: dict[UUID, int],
    users: dict[UUID, UUID],
) -> None:
    values = []
    for task in annotation_tasks:
        if not task.status_badges:
            continue

        task_db_id = annotation_task_mapping.get(task.uuid)
        if task_db_id is None:
            continue

        for badge in task.status_badges:
            user_db_id = (
                None if badge.owner is None else users.get(badge.owner)
            )
            values.append(
                {
                    "annotation_task_id": task_db_id,
                    "state": badge.state,
                    "user_id": user_db_id,
                }
            )

    await create_objects_without_duplicates(
        session,
        models.AnnotationStatusBadge,
        values,
        key=lambda v: (v["annotation_task_id"], v["state"], v["user_id"]),
        key_column=tuple_(
            models.AnnotationStatusBadge.annotation_task_id,
            models.AnnotationStatusBadge.state,
            models.AnnotationStatusBadge.user_id,
        ),
    )
