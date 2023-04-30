"""Module for defining the AccessToken Model."""
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyBaseAccessTokenTableUUID,
)

from whombat.database.models.base import Base

__all__ = [
    "AccessToken",
]


class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, Base):
    """The AccessToken model.

    The access token model is used to store the tokens used for authentication
    and authorization. It is a subclass of the
    SQLAlchemyBaseAccessTokenTableUUID class from the fastapi-users package.
    """

    def __init__(self, *_, **kwargs):
        """Initialize the AccessToken model.

        Parameters
        ----------
        **kwargs
            The keyword arguments to pass to the SQLAlchemyBaseAccessTokenTableUUID
            class.

        """
        super().__init__(**kwargs)
