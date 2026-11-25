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

    # Get the annotation
    response = client.get(
        "/api/v1/sound_event_annotations/",
        cookies=cookies,
    )
    assert response.status_code == 200
    obj = response.json()
    assert obj["total"] == 1
    item = obj["items"][0]
    assert item["sound_event"]["geometry"]["coordinates"] == [0, 1000, 1, 2000]


async def test_can_create_region_and_add_tag(
    client: TestClient,
    clip_annotation: schemas.ClipAnnotation,
    cookies: dict[str, str],
):
    for value in ("initial", "added"):
        response = client.post(
            "/api/v1/tags/",
            json={"key": "test", "value": value},
            cookies=cookies,
        )
        assert response.status_code == 200, response.text

    response = client.post(
        "/api/v1/sound_event_annotations/",
        params={"clip_annotation_uuid": str(clip_annotation.uuid)},
        json={
            "geometry": data.BoundingBox(
                coordinates=[0, 1000, 1, 2000]
            ).model_dump(),
            "tags": [{"key": "test", "value": "initial"}],
        },
        cookies=cookies,
    )
    assert response.status_code == 200, response.text
    uuid = response.json()["uuid"]

    response = client.post(
        "/api/v1/sound_event_annotations/detail/tags/",
        params={
            "sound_event_annotation_uuid": uuid,
            "key": "test",
            "value": "added",
        },
        cookies=cookies,
    )
    assert response.status_code == 200, response.text

    response = client.get(
        "/api/v1/sound_event_annotations/detail/",
        params={"sound_event_annotation_uuid": uuid},
        cookies=cookies,
    )
    assert response.status_code == 200, response.text
    assert {tag["value"] for tag in response.json()["tags"]} == {
        "initial",
        "added",
    }
