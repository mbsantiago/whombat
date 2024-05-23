"""Test the annotation task endpoints."""

from fastapi.testclient import TestClient

from whombat import schemas


async def test_correct_clip_annotation_is_returned(
    client: TestClient,
    clip_annotation: schemas.ClipAnnotation,
    annotation_task: schemas.AnnotationTask,
    cookies: dict[str, str],
):
    """Test that the correct clip annotation is returned."""
    response = client.get(
        "/api/v1/annotation_tasks/detail/clip_annotation/",
        params={
            "annotation_task_uuid": str(annotation_task.uuid),
        },
        cookies=cookies,
    )
    assert response.status_code == 200

    clip_annotation_response = response.json()
    assert clip_annotation_response["uuid"] == str(clip_annotation.uuid)


async def test_clip_tag_cannot_be_added_if_not_in_project_tags(
    client: TestClient,
    tag: schemas.Tag,
    annotation_task: schemas.AnnotationTask,
    clip_annotation: schemas.ClipAnnotation,
    cookies: dict[str, str],
):
    """Test that the admin user can login."""
    assert clip_annotation.tags == []

    response = client.post(
        "/api/v1/annotation_tasks/detail/clip_tags/",
        params={
            "annotation_task_uuid": str(annotation_task.uuid),
            "clip_annotation_uuid": str(clip_annotation.uuid),
            "key": tag.key,
            "value": tag.value,
        },
        cookies=cookies,
    )
    assert not response.is_success
    assert response.status_code == 400
    assert "Tag does not belong to the annotation project" in response.text
