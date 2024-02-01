import pytest
from fastapi.testclient import TestClient

from whombat import schemas
from whombat.system import create_app
from whombat.system.settings import Settings, get_settings


@pytest.fixture
async def client(settings: Settings):
    """Fixture to initialize the test database."""
    app = create_app(settings)

    app.dependency_overrides[get_settings] = lambda: settings

    with TestClient(app) as client:
        yield client


@pytest.fixture
def cookies(client: TestClient, user: schemas.SimpleUser) -> dict[str, str]:
    """Fixture to get the cookies from a logged in user."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": user.username,
            "password": "password",
        },
    )

    assert response.status_code == 204
    name, value = response.headers["set-cookie"].split(";")[0].split("=")
    return {name: value}
