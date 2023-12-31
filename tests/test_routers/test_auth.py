"""Test the Auth endpoints."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from whombat.app import app
from whombat.database.init import init_database
from whombat.settings import Settings


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
            "username": "test_admin",
            "password": "test_password",
        },
    )
    assert response.status_code == 204
