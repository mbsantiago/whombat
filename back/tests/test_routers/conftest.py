from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from whombat.routes.dependencies import get_settings
from whombat.system import create_app
from whombat.system.settings import Settings


@pytest.fixture
async def client(database_test: Path, settings: Settings):
    """Fixture to initialize the test database."""
    app = create_app(settings)

    app.dependency_overrides[get_settings] = lambda: settings

    with TestClient(app) as client:
        yield client

    database_test.unlink()
