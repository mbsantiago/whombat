"""Whombat Python API to interact with user objects in the database."""
import uuid

from cachetools import LRUCache
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common
from whombat.dependencies.users import UserDatabase, UserManager
from whombat.filters import Filter

__all__ = [
    "create",
    "get_by_id",
    "get_by_email",
    "get_by_username",
    "get_many",
    "update",
    "delete",
]


users_cache = cache.CacheCollection(schemas.User)


def _get_user_manager(session: AsyncSession) -> UserManager:
    """Get a user manager from a database session.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    Returns
    -------
    UserManager
        The user manager.

    """
    return UserManager(
        UserDatabase(session, models.User),
    )


@users_cache.cached(
    name="user_by_id",
    cache=LRUCache(maxsize=100),
    key=lambda _, user_id: user_id,
    data_key=lambda user: user.id,
)
async def get_by_id(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> schemas.User:
    """Get a user by id.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    user_id : uuid.UUID
        The id to use.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    whombat.exceptions.NotFoundError
    """
    obj = await common.get_object(
        session, models.User, models.User.id == user_id
    )
    return schemas.User.model_validate(obj)


@users_cache.cached(
    name="user_by_username",
    cache=LRUCache(maxsize=100),
    key=lambda _, username: username,
    data_key=lambda user: user.username,
)
async def get_by_username(
    session: AsyncSession,
    username: str,
) -> schemas.User:
    """Get a user by username.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    username : str
        The username to use.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    whombat.exceptions.NotFoundError

    """
    obj = await common.get_object(
        session, models.User, models.User.username == username
    )
    return schemas.User.model_validate(obj)


@users_cache.cached(
    name="user_by_email",
    cache=LRUCache(maxsize=100),
    key=lambda _, email: email,
    data_key=lambda user: user.email,
)
async def get_by_email(
    session: AsyncSession,
    email: str,
) -> schemas.User:
    """Get a user by email.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    email : str
        The email to use.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    whombat.exceptions.NotFoundError

    """
    obj = await common.get_object(
        session, models.User, models.User.email == email
    )
    return schemas.User.model_validate(obj)


async def get_many(
    session: AsyncSession,
    *,
    offset: int = 0,
    limit: int = 100,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.User], int]:
    """Get all users.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    offset : int, optional
        The number of users to skip, by default 0.

    limit : int, optional
        The number of users to get, by default 100.

    filters : list[Filter], optional
        The filters to apply, by default None.

    sort_by : str, optional
        The field to sort by, by default "-created_at".

    Returns
    -------
    users : List[schemas.User]
        The users that match the filters.

    count : int
        The total number of users that match the filters.
    """
    db_users, count = await common.get_objects(
        session,
        models.User,
        offset=offset,
        limit=limit,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.User.model_validate(db_user) for db_user in db_users
    ], count


@users_cache.with_update
async def create(
    session: AsyncSession,
    data: schemas.UserCreate,
) -> schemas.User:
    """Create a user.

    This function creates a user in the database.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data : schemas.UserCreate
        The data to use for the user creation.

    Returns
    -------
    user : schemas.User

    Notes
    -----
    This function is asynchronous.

    Raises
    ------
    UserAlreadyExists
        If a user with the same username or email already exists.

    Examples
    --------
    To create a user:

    .. code-block:: python

        async with create_session() as session:
            user = await create_user(
                session,
                username="username",
                password="password",
                email="email",
            )

    """
    user_manager = _get_user_manager(session)
    db_user = await user_manager.create(data)
    session.add(db_user)
    await session.flush()
    return schemas.User.model_validate(db_user)


@users_cache.with_update
async def update(
    session: AsyncSession,
    user_id: uuid.UUID,
    data: schemas.UserUpdate,
) -> schemas.User:
    """Update a user.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    user_id : uuid.UUID
        The id of the user to update.

    data : schemas.UserUpdate
        The data to update the user with.

    Returns
    -------
    user : schemas.User

    Raises
    ------
    sqlalchemy.exc.NoResultFound
        If no user with the given id exists.

    """
    user_manager = _get_user_manager(session)
    db_user = await user_manager.get(user_id)
    db_user = await user_manager.update(data, db_user)
    return schemas.User.model_validate(db_user)


@users_cache.with_clear
async def delete(session: AsyncSession, user_id: uuid.UUID) -> schemas.User:
    """Delete a user.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    user_id : uuid.UUID
        The id of the user to delete.

    """
    user = await common.delete_object(
        session,
        models.User,
        models.User.id == user_id,
    )
    return schemas.User.model_validate(user)
