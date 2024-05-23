"""Test the Sound Event Annotation endpoints."""

from fastapi.testclient import TestClient

from whombat import schemas


async def test_that_test_annotation_project_has_no_tags(
    client: TestClient,
    annotation_project: schemas.AnnotationProject,
    cookies: dict[str, str],
):
    """Test that the admin user can login."""
    response = client.get(
        "/api/v1/annotation_projects/detail/",
        params={
            "annotation_project_uuid": str(annotation_project.uuid),
        },
        cookies=cookies,
    )

    assert response.status_code == 200
    project = response.json()

    assert "tags" in project
    assert project["tags"] == []
