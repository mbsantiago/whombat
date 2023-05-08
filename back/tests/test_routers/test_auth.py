"""Test the Auth endpoints."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from whombat.app import app
from whombat.database.init import init_database
from whombat.settings import Settings, get_settings


@pytest.fixture
def database_test(tmpdir) -> Path:
    """Fixture to create a temporary database."""
    path = Path(tmpdir)
    return path / "test.db"


@pytest.fixture
def settings(database_test: Path):
    """Fixture to return the settings."""
    settings = Settings(
        db_url=f"sqlite+aiosqlite:///{database_test.absolute()}",
        app_name="Whombat",
        admin_username="test_admin",
        admin_password="test_password",
        admin_email="test@whombat.com",
    )
    app.dependency_overrides[get_settings] = lambda: settings
    return settings


@pytest.fixture
async def client(database_test: Path, settings: Settings):
    """Fixture to initialize the test database."""
    await init_database(settings)

    with TestClient(app) as client:
        yield client

    database_test.unlink()


async def test_admin_can_login(client: TestClient):
    """Test that the admin user can login."""
    response = client.post(
        "/auth/login",
        data={
            "username": "test@whombat.com",
            "password": "test_password",
        },
    )
    assert response.status_code == 204
