"""Test the Annotation Project endpoints."""

from fastapi.testclient import TestClient
from soundevent.io import aoef

from whombat import schemas


def test_exported_annotation_projects_paths_are_relative(
    client: TestClient,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
    cookies: dict[str, str],
):
    # Create annotation task
    response = client.post(
        "/api/v1/annotation_tasks/",
        params={
            "annotation_project_uuid": str(annotation_project.uuid),
        },
        json=[str(clip.uuid)],
        cookies=cookies,
    )

    assert response.status_code == 200

    # Download
    response = client.get(
        "/api/v1/annotation_projects/detail/download/",
        params={
            "annotation_project_uuid": str(annotation_project.uuid),
        },
        cookies=cookies,
    )

    assert response.status_code == 200

    content = aoef.AOEFObject.model_validate(response.json())

    assert content.data.recordings
    assert len(content.data.recordings) == 1

    recording = content.data.recordings[0]
    assert not recording.path.is_absolute()
