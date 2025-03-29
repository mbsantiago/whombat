"""Test suite for the Tags endpoints."""

from fastapi.testclient import TestClient

from whombat import schemas


async def test_create_tag_returns_existing_tag_if_duplicate(
    client: TestClient,
    tag: schemas.Tag,
    cookies: dict[str, str],
):
    response = client.post(
        "/api/v1/tags/",
        json={"key": tag.key, "value": tag.value},
        cookies=cookies,
    )

    assert response.status_code == 200
    content = response.json()

    assert content["key"] == tag.key
    assert content["value"] == tag.value

    # And do it again for good measure
    response = client.post(
        "/api/v1/tags/",
        json={"key": tag.key, "value": tag.value},
        cookies=cookies,
    )
    assert response.status_code == 200
