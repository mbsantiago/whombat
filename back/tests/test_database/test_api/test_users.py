"""Test the database API module."""
from typing import AsyncGenerator
import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound  # type: ignore
from sqlalchemy.future import select

from whombat.database import api, models


@pytest.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    """Create a session that uses an in-memory database."""
    async with api.sessions.create() as sess:
        yield sess


@pytest.mark.asyncio
async def test_create_session():
    """Test creating a database session."""
    async with api.sessions.create() as session:
        assert isinstance(session, AsyncSession)
        assert session.is_active


@pytest.mark.asyncio
async def test_session_was_created_with_default_db_url():
    """Test that the session was created with the default database URL."""
    async with api.sessions.create() as session:
        engine = session.get_bind()
        assert str(engine.url) == "sqlite+aiosqlite://"


@pytest.mark.asyncio
async def test_tables_are_setup_correctly_when_creating_session():
    """Test that the tables are setup correctly."""
    async with api.sessions.create() as session:
        # Check that the user table exists and is empty
        q = select(models.User)
        result = await session.execute(q)
        assert result.scalar_one_or_none() is None

        # Check that the access token table exists and is empty
        q = select(models.AccessToken)
        result = await session.execute(q)
        assert result.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_create_user():
    """Test creating a user."""
    # Arrange
    async with api.sessions.create() as session:
        # Act
        user = await api.users.create(
            session=session,
            username="test",
            password="test",
            email="foo@bar.com",  # type: ignore
        )

    # Assert
    assert isinstance(user, models.User)
    assert user.username == "test"
    assert user.email == "foo@bar.com"
    assert user.is_active
    assert not user.is_superuser


@pytest.mark.asyncio
async def test_create_user_with_is_superuser():
    """Test creating a user with is_superuser set to True."""
    # Arrange
    async with api.sessions.create() as session:
        # Act
        user = await api.users.create(
            session=session,
            username="test",
            password="test",
            email="foo@gmail.com",
            is_superuser=True,
        )

    # Assert
    assert isinstance(user, models.User)
    assert user.username == "test"
    assert user.email == "foo@gmail.com"
    assert user.is_active
    assert user.is_superuser


@pytest.mark.asyncio
async def test_get_user_by_username():
    """Test getting a user by username."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create(
            session=session,
            username="test",
            password="test",
            email="foo@gmail.com",
        )
        user_id = user.id

        # Act
        queried_user = await api.users.get_by_username(
            session=session,
            username="test",
        )

        # Assert
        assert queried_user.id == user_id


@pytest.mark.asyncio
async def test_raises_no_result_found_when_getting_user_by_username():
    """Test that NoResultFound is raised when getting a user by username."""
    async with api.sessions.create() as session:
        with pytest.raises(NoResultFound):
            await api.users.get_by_username(
                session=session,
                username="test",
            )


@pytest.mark.asyncio
async def test_get_user_by_id():
    """Test getting a user by id."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create(
            session=session,
            username="test",
            password="test",
            email="foo@gmail.com",
        )

        # Act
        queried_user = await api.users.get_by_id(
            session=session,
            user_id=user.id,
        )

        # Assert
        assert user == queried_user


@pytest.mark.asyncio
async def test_raises_no_result_found_when_getting_user_by_id():
    """Test that NoResultFound is raised when getting a user by id."""
    async with api.sessions.create() as session:
        with pytest.raises(NoResultFound):
            await api.users.get_by_id(
                session=session,
                user_id=uuid.uuid4(),
            )


@pytest.mark.asyncio
async def test_get_user_by_email():
    """Test getting a user by email."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create(
            session=session,
            username="test",
            password="test",
            email="foo@bar.com",
        )

        # Act
        queried_user = await api.users.get_by_email(
            session=session,
            email="foo@bar.com",
        )

        # Assert
        assert user == queried_user


@pytest.mark.asyncio
async def test_raises_no_result_found_when_getting_user_by_email():
    """Test that NoResultFound is raised when getting a user by email."""
    async with api.sessions.create() as session:
        with pytest.raises(NoResultFound):
            await api.users.get_by_email(
                session=session,
                email="foo@bar.com",
            )
