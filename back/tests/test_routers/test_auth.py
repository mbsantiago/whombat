"""Test the Auth endpoints."""

from fastapi.testclient import TestClient

from whombat import schemas


async def test_admin_can_login(client: TestClient, user: schemas.User):
    """Test that the admin user can login."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": user.username,
            "password": "password",
        },
    )

    assert response.status_code == 204
