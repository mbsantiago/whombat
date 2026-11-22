"""Test suite for annotation task API."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, schemas
from whombat.system import create_app
from whombat.system.settings import get_settings


async def test_cant_delete_annotation_task_clip(
    session: AsyncSession,
    annotation_task: schemas.AnnotationTask,
):
    clip = await api.annotation_tasks.get_clip(session, annotation_task)

    with pytest.raises(IntegrityError):
        await api.clips.delete(session, clip)


async def test_list_tasks_includes_dataset_name(
    session: AsyncSession,
    settings,
    annotation_task: schemas.AnnotationTask,
    annotation_project: schemas.AnnotationProject,
    dataset_recording: schemas.Recording,
):
    clip = await api.clips.create(
        session,
        recording=dataset_recording,
        start_time=0.1,
        end_time=0.2,
    )
    clip_annotation = await api.clip_annotations.create(session, clip=clip)
    dataset_task = await api.annotation_tasks.create(
        session,
        annotation_project=annotation_project,
        clip=clip,
        clip_annotation_id=clip_annotation.id,
    )
    await session.commit()

    app = create_app(settings)
    app.dependency_overrides[get_settings] = lambda: settings
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/annotation_tasks/",
            params={
                "annotation_project__eq": str(annotation_project.uuid),
                "limit": -1,
            },
        )

    assert response.status_code == 200
    tasks = {task["uuid"]: task for task in response.json()["items"]}
    assert tasks[str(dataset_task.uuid)]["dataset_name"] == "test_dataset"
    assert tasks[str(annotation_task.uuid)]["dataset_name"] is None


async def test_list_tasks_searches_exact_task_uuid(
    session: AsyncSession,
    settings,
    annotation_task: schemas.AnnotationTask,
    annotation_project: schemas.AnnotationProject,
):
    app = create_app(settings)
    app.dependency_overrides[get_settings] = lambda: settings
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/annotation_tasks/",
            params={
                "annotation_project__eq": str(annotation_project.uuid),
                "search_recordings": str(annotation_task.uuid),
                "limit": -1,
            },
        )

    assert response.status_code == 200
    assert [task["uuid"] for task in response.json()["items"]] == [
        str(annotation_task.uuid),
    ]
