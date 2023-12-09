"""Test the Auth endpoints."""

from fastapi.testclient import TestClient


async def test_admin_can_login(client: TestClient):
    """Test that the admin user can login."""
    print(client._base_url)
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test_admin",
            "password": "test_password",
        },
    )
    assert response.status_code == 204
