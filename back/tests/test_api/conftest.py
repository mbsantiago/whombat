"""Common test fixtures for Whombat Python API."""
from typing import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, schemas


@pytest.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    """Create a session that uses an in-memory database."""
    async with api.sessions.create_session() as sess:
        yield sess


@pytest.fixture
async def user(session: AsyncSession) -> schemas.User:
    """Create a user for tests."""
    user = await api.users.create_user(
        session,
        username="test",
        password="test",
        email="test@whombat.com",
    )
    return user
