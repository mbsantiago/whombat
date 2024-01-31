"""Whombat Python API to interact with user objects in the database."""

import secrets
from uuid import UUID

from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.system.users import UserDatabase, UserManager

__all__ = []


class UserAPI(
    BaseAPI[
        UUID,
        models.User,
        schemas.SimpleUser,
        schemas.UserCreate,
        schemas.UserUpdate,
    ]
):
    """API to interact with user objects in the database."""

    _model = models.User
    _schema = schemas.SimpleUser

    async def get_by_username(
        self,
        session: AsyncSession,
        username: str,
    ) -> schemas.SimpleUser:
        """Get a user by username.

        Parameters
        ----------
        session
            The database session to use.
        username
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
        return schemas.SimpleUser.model_validate(obj)

    async def get_by_email(
        self,
        session: AsyncSession,
        email: str,
    ) -> schemas.SimpleUser:
        """Get a user by email.

        Parameters
        ----------
        session
            The database session to use.
        email
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
        return schemas.SimpleUser.model_validate(obj)

    async def create(
        self,
        session: AsyncSession,
        username: str,
        password: str,
        email: str,
        name: str | None = None,
        is_active: bool = True,
        is_superuser: bool = False,
    ) -> schemas.SimpleUser:
        """Create a user.

        This function creates a user in the database.

        Parameters
        ----------
        session
            The database session to use.
        username
            The username of the user.
        password
            The password of the user.
        email
            The email of the user.
        name
            The users full name.
        is_active
            Whether the user is active. This means that the user can log in.
            By default, this is set to True.
        is_superuser
            Whether the user is a superuser. This means that the user can
            perform all actions.

        Returns
        -------
        user : schemas.User

        Raises
        ------
        UserAlreadyExists
            If a user with the same username or email already exists.

        Examples
        --------
        To create a user:


        ```python
            async with create_session() as session:
                user = await create_user(
                    session,
                    username="username",
                    password="password",
                    email="email",
                )
        ```
        """
        user_manager = _get_user_manager(session)
        db_user = await user_manager.create(
            schemas.UserCreate(
                username=username,
                password=password,
                email=email,
                name=name,
                is_active=is_active,
                is_superuser=is_superuser,
                is_verified=True,
            )
        )
        session.add(db_user)
        await session.flush()
        return schemas.SimpleUser.model_validate(db_user)

    async def update(
        self,
        session: AsyncSession,
        obj: schemas.SimpleUser,
        data: schemas.UserUpdate,
    ) -> schemas.SimpleUser:
        """Update a user.

        Parameters
        ----------
        session
            The database session to use.
        obj
            The user to update.
        data
            The data to update the user with.

        Returns
        -------
        user : schemas.User
            The updated user.

        Raises
        ------
        sqlalchemy.exc.NoResultFound
            If no user with the given id exists.
        """
        user_manager = _get_user_manager(session)
        db_user = await user_manager.get(obj.id)
        db_user = await user_manager.update(data, db_user)
        return schemas.SimpleUser.model_validate(db_user)

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.User,
    ) -> schemas.SimpleUser:
        """Get or create a user from a soundevent user object.

        Parameters
        ----------
        session
            The database session to use.
        data
            The soundevent user object to get or create.

        Returns
        -------
        user : schemas.User
            The user object.

        Raises
        ------
        whombat.exceptions.DuplicateObjectError
            If a user with the same username or email already exists.

        Notes
        -----
        If no user with the same username, email or UUID exists, a new user
        will be created with a random password and marked as inactive.
        """
        try:
            return await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            manager = _get_user_manager(session)
            password = _generate_random_password()
            hashed_password = manager.password_helper.hash(password)
            created_user = await manager.user_db.create(
                dict(
                    id=data.uuid,
                    username=data.username,
                    email=data.email,
                    name=data.name,
                    hashed_password=hashed_password,
                    is_active=False,
                    is_superuser=False,
                )
            )
            await session.flush()
            return schemas.SimpleUser.model_validate(created_user)

    def to_soundevent(
        self,
        obj: schemas.SimpleUser,
    ) -> data.User:
        """Convert a user instance to soundevent object.

        Parameters
        ----------
        obj
            The user to get the data from.

        Returns
        -------
        user : data.User
            The soundevent user object.
        """
        return data.User(
            uuid=obj.id,
            username=obj.username,
            email=obj.email,
            name=obj.name,
        )

    def _get_pk_condition(self, pk: UUID):
        return models.User.id == pk

    def _get_pk_from_obj(self, obj: schemas.SimpleUser):
        return obj.id


def _generate_random_password(length=32):
    return secrets.token_urlsafe(length)


def _get_user_manager(session: AsyncSession) -> UserManager:
    """Get a user manager from a database session.

    Parameters
    ----------
    session
        The database session to use.

    Returns
    -------
    UserManager
        The user manager.
    """
    return UserManager(
        UserDatabase(session, models.User),
    )


def generate_random_password_hash(session: AsyncSession, length=32):
    """Generate a random password and hash it.

    Parameters
    ----------
    session
        The database session to use.
    length
        The length of the password to generate.

    Returns
    -------
    password_hash : str
        The generated password hash.
    """
    user_manager = _get_user_manager(session)
    password = _generate_random_password(length)
    return user_manager.password_helper.hash(password)


users = UserAPI()
