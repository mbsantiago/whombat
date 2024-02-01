"""Test the Sound Event Annotation endpoints."""

from fastapi.testclient import TestClient
from soundevent import data

from whombat import schemas


async def test_can_create_a_sound_event_annotation(
    client: TestClient,
    clip_annotation: schemas.ClipAnnotation,
    cookies: dict[str, str],
):
    """Test that the admin user can login."""
    bounding_box = data.BoundingBox(coordinates=[0, 1000, 1, 2000])

    response = client.post(
        "/api/v1/sound_event_annotations/",
        params={
            "clip_annotation_uuid": str(clip_annotation.uuid),
        },
        json={"geometry": bounding_box.model_dump()},
        cookies=cookies,
    )

    assert response.status_code == 200
