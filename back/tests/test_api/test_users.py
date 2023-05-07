"""Test the database API module."""
import uuid

import pytest
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from whombat import api, schemas
from whombat.database import models
from whombat import exceptions


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
        if not isinstance(engine, Engine):
            raise TypeError("engine is not an instance of Engine")
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
        user = await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="foo@bar.com",  # type: ignore
        )

    # Assert
    assert isinstance(user, schemas.users.User)
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
        user = await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="foo@gmail.com",
            is_superuser=True,
        )

    # Assert
    assert isinstance(user, schemas.users.User)
    assert user.username == "test"
    assert user.email == "foo@gmail.com"
    assert user.is_active
    assert user.is_superuser


@pytest.mark.asyncio
async def test_get_user_by_username():
    """Test getting a user by username."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="foo@gmail.com",
        )
        user_id = user.id

        # Act
        queried_user = await api.users.get_user_by_username(
            session=session,
            username="test",
        )

        # Assert
        assert queried_user.id == user_id


@pytest.mark.asyncio
async def test_raises_no_result_found_when_getting_user_by_username():
    """Test that NoResultFound is raised when getting a user by username."""
    async with api.sessions.create() as session:
        with pytest.raises(exceptions.NotFoundError):
            await api.users.get_user_by_username(
                session=session,
                username="test",
            )


@pytest.mark.asyncio
async def test_get_user_by_id():
    """Test getting a user by id."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="foo@gmail.com",
        )

        # Act
        queried_user = await api.users.get_user_by_id(
            session=session,
            user_id=user.id,
        )

        # Assert
        assert user == queried_user


@pytest.mark.asyncio
async def test_raises_no_result_found_when_getting_user_by_id():
    """Test that NoResultFound is raised when getting a user by id."""
    async with api.sessions.create() as session:
        with pytest.raises(exceptions.NotFoundError):
            await api.users.get_user_by_id(
                session=session,
                user_id=uuid.uuid4(),
            )


@pytest.mark.asyncio
async def test_get_user_by_email():
    """Test getting a user by email."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="foo@bar.com",
        )

        # Act
        queried_user = await api.users.get_user_by_email(
            session=session,
            email="foo@bar.com",
        )

        # Assert
        assert user == queried_user


@pytest.mark.asyncio
async def test_raises_no_result_found_when_getting_user_by_email():
    """Test that NoResultFound is raised when getting a user by email."""
    async with api.sessions.create() as session:
        with pytest.raises(exceptions.NotFoundError):
            await api.users.get_user_by_email(
                session=session,
                email="foo@bar.com",
            )


@pytest.mark.asyncio
async def test_get_all_users():
    """Test getting all users."""
    async with api.sessions.create() as session:
        # Arrange
        await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="test1@whombat.com",
        )
        await api.users.create_user(
            session=session,
            username="test2",
            password="test",
            email="test2@whombat.com",
        )

        # Act
        users = await api.users.get_users(session=session)

        # Assert
        assert len(users) == 2

        for user in users:
            assert isinstance(user, schemas.users.User)

        # Act
        users = await api.users.get_users(session=session, limit=1)

        # Assert
        assert len(users) == 1
        assert users[0].username == "test"

        # Act
        users = await api.users.get_users(session=session, offset=1)

        # Assert
        assert len(users) == 1
        assert users[0].username == "test2"


@pytest.mark.asyncio
async def test_update_user():
    """Test updating a user."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="test@whombat.com",
        )

        assert user.email == "test@whombat.com"

        # Act
        updated_user = await api.users.update_user(
            session=session, user=user, email="foo@whombat.com"
        )

        # Assert
        assert updated_user.email == "foo@whombat.com"

        # Make sure the changes were saved to the database
        queried_user = await api.users.get_user_by_id(
            session=session,
            user_id=user.id,
        )

        assert queried_user.email == "foo@whombat.com"


@pytest.mark.asyncio
async def test_delete_user():
    """Test deleting a user."""
    async with api.sessions.create() as session:
        # Arrange
        user = await api.users.create_user(
            session=session,
            username="test",
            password="test",
            email="foo@whombat.com",
        )

        # Make sure the user exists
        await api.users.get_user_by_id(session=session, user_id=user.id)

        # Act
        await api.users.delete_user(session=session, user=user)

        # Assert
        with pytest.raises(exceptions.NotFoundError):
            await api.users.get_user_by_id(
                session=session,
                user_id=user.id,
            )
