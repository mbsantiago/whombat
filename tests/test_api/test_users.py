"""Test the database API module."""
import uuid

import pytest
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from whombat import api, exceptions, models, schemas


async def test_create_session():
    """Test creating a database session."""
    async with api.sessions.create() as session:
        assert isinstance(session, AsyncSession)
        assert session.is_active


async def test_session_was_created_with_default_db_url(session: AsyncSession):
    """Test that the session was created with the default database URL."""
    engine = session.get_bind()
    if not isinstance(engine, Engine):
        raise TypeError("engine is not an instance of Engine")
    assert str(engine.url) == "sqlite+aiosqlite://"


async def test_tables_are_setup_correctly_when_creating_session(
    session: AsyncSession,
):
    """Test that the tables are setup correctly."""
    # Check that the user table exists and is empty
    q = select(models.User)
    result = await session.execute(q)
    assert result.scalar_one_or_none() is None

    # Check that the access token table exists and is empty
    q = select(models.AccessToken)
    result = await session.execute(q)
    assert result.scalar_one_or_none() is None


async def test_create_user(session: AsyncSession):
    """Test creating a user."""
    # Act
    data = schemas.UserCreate(
        username="test",
        password="test",
        email="foo@bar.com",
    )
    user = await api.users.create(session=session, data=data)

    # Assert
    assert isinstance(user, schemas.User)
    assert user.username == "test"
    assert user.email == "foo@bar.com"
    assert user.is_active
    assert not user.is_superuser


async def test_create_user_with_is_superuser(session: AsyncSession):
    """Test creating a user with is_superuser set to True."""
    # Act
    data = schemas.UserCreate(
        username="test",
        password="test",
        email="foo@gmail.com",
        is_superuser=True,
    )

    user = await api.users.create(session=session, data=data)

    # Assert
    assert isinstance(user, schemas.User)
    assert user.username == "test"
    assert user.email == "foo@gmail.com"
    assert user.is_active
    assert user.is_superuser


async def test_get_user_by_username(session: AsyncSession):
    """Test getting a user by username."""
    # Arrange
    data = schemas.UserCreate(
        username="test",
        password="test",
        email="foo@gmail.com",
    )

    user = await api.users.create(session=session, data=data)
    user_id = user.id

    # Act
    queried_user = await api.users.get_by_username(
        session,
        username="test",
    )

    # Assert
    assert queried_user.id == user_id


async def test_raises_no_result_found_when_getting_user_by_username(
    session: AsyncSession,
):
    """Test that NoResultFound is raised when getting a user by username."""
    with pytest.raises(exceptions.NotFoundError):
        await api.users.get_by_username(
            session,
            username="test",
        )


async def test_get_user_by_id(session: AsyncSession):
    """Test getting a user by id."""
    # Arrange
    data = schemas.UserCreate(
        username="test",
        password="test",
        email="foo@gmail.com",
    )
    user = await api.users.create(session=session, data=data)

    # Act
    queried_user = await api.users.get_by_id(
        session,
        user_id=user.id,
    )

    # Assert
    assert user == queried_user


async def test_raises_no_result_found_when_getting_user_by_id(
    session: AsyncSession,
):
    """Test that NoResultFound is raised when getting a user by id."""
    with pytest.raises(exceptions.NotFoundError):
        await api.users.get_by_id(
            session,
            user_id=uuid.uuid4(),
        )


async def test_get_user_by_email(session: AsyncSession):
    """Test getting a user by email."""
    # Arrange
    data = schemas.UserCreate(
        username="test",
        password="test",
        email="foo@bar.com",
    )
    user = await api.users.create(session=session, data=data)

    # Act
    queried_user = await api.users.get_by_email(
        session,
        email="foo@bar.com",
    )

    # Assert
    assert user == queried_user


async def test_raises_no_result_found_when_getting_user_by_email(
    session: AsyncSession,
):
    """Test that NoResultFound is raised when getting a user by email."""
    with pytest.raises(exceptions.NotFoundError):
        await api.users.get_by_email(
            session,
            email="foo@bar.com",
        )


async def test_get_all_users(session: AsyncSession):
    """Test getting all users."""
    # Arrange
    data1 = schemas.UserCreate(
        username="test",
        password="test",
        email="test1@whombat.com",
    )
    await api.users.create(session=session, data=data1)

    data2 = schemas.UserCreate(
        username="test2",
        password="test",
        email="test2@whombat.com",
    )
    await api.users.create(session=session, data=data2)

    # Act
    users, _ = await api.users.get_many(session=session)

    # Assert
    assert len(users) == 2

    for user in users:
        assert isinstance(user, schemas.User)

    # Act
    users, _ = await api.users.get_many(session=session, limit=1)

    # Assert
    assert len(users) == 1
    assert users[0].username == "test2"

    # Act
    users, _ = await api.users.get_many(session=session, offset=1)

    # Assert
    assert len(users) == 1
    assert users[0].username == "test"


async def test_update_user(session: AsyncSession):
    """Test updating a user."""
    # Arrange
    data = schemas.UserCreate(
        username="test",
        password="test",
        email="test@whombat.com",
    )
    user = await api.users.create(session=session, data=data)

    assert user.email == "test@whombat.com"

    # Act
    data = schemas.UserUpdate(email="foo@whombat.com")
    updated_user = await api.users.update(
        session=session,
        user_id=user.id,
        data=data,
    )

    # Assert
    assert updated_user.email == "foo@whombat.com"

    # Make sure the changes were saved to the database
    queried_user = await api.users.get_by_id(
        session,
        user_id=user.id,
    )

    assert queried_user.email == "foo@whombat.com"


async def test_delete_user(session: AsyncSession):
    """Test deleting a user."""
    # Arrange
    data = schemas.UserCreate(
        username="test",
        password="test",
        email="foo@whombat.com",
    )
    user = await api.users.create(session=session, data=data)

    # Make sure the user exists
    await api.users.get_by_id(session, user_id=user.id)

    # Act
    await api.users.delete(session, user_id=user.id)

    # Assert
    with pytest.raises(exceptions.NotFoundError):
        await api.users.get_by_id(
            session,
            user_id=user.id,
        )


async def test_delete_user_fails_if_nonexistent(
    session: AsyncSession,
):
    """Test that deleting a nonexistent user fails."""
    # Act/Assert
    with pytest.raises(exceptions.NotFoundError):
        await api.users.delete(session, user_id=uuid.uuid4())
