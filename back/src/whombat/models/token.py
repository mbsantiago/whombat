"""Module for defining the AccessToken Model."""

import datetime
from uuid import UUID

import sqlalchemy.orm as orm
from fastapi_users_db_sqlalchemy.generics import GUID
from sqlalchemy import ForeignKey, String
from sqlalchemy.ext.hybrid import hybrid_property

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

    # NOTE: The hybrid_property decorator is used to make the created_at
    # attribute available to the AccessToken model. This attribute is not
    # stored in the database, but is instead calculated from the created_on
    # attribute.
    @hybrid_property
    def created_at(self) -> datetime.datetime:
        return self.created_on

    @created_at.expression
    @classmethod
    def _created_at_expression(cls):
        return cls.created_on
