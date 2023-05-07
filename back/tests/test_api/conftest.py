"""Common test fixtures for Whombat Python API."""
from typing import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api


@pytest.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    """Create a session that uses an in-memory database."""
    async with api.sessions.create() as sess:
        yield sess
