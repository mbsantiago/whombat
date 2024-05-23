"""Test the Sound Event Annotation endpoints."""

from fastapi.testclient import TestClient

from whombat import schemas


async def test_that_test_clip_annotation_has_no_tags(
    client: TestClient,
    clip_annotation: schemas.ClipAnnotation,
    cookies: dict[str, str],
):
    """Test that the admin user can login."""
    response = client.get(
        "/api/v1/clip_annotations/detail/",
        params={
            "clip_annotation_uuid": str(clip_annotation.uuid),
        },
        cookies=cookies,
    )

    assert response.status_code == 200
    clip = response.json()

    assert "tags" in clip
    assert clip["tags"] == []
