"""Module for defining the AccessToken Model."""
from uuid import UUID

import sqlalchemy.orm as orm
from fastapi_users_db_sqlalchemy.generics import GUID
from sqlalchemy import ForeignKey, String

from whombat.models.base import Base

__all__ = [
    "AccessToken",
]


class AccessToken(Base):
    """The AccessToken model.

    The access token model is used to store the tokens used for authentication
    and authorization.

    Attributes
    ----------
    token
        The access token.
    user_id
        The id of the user to which the access token belongs.

    Notes
    -----
    We use the fastapi-users package to handle authentication and
    authorization. The AccessToken model is a subclass of the
    SQLAlchemyBaseAccessTokenTableUUID class from the fastapi-users package.
    """

    __tablename__ = "accesstoken"

    token: orm.Mapped[str] = orm.mapped_column(
        String(length=43),
        primary_key=True,
    )
    user_id: orm.Mapped[UUID] = orm.mapped_column(
        GUID,
        ForeignKey("user.id", ondelete="cascade"),
        nullable=False,
    )
