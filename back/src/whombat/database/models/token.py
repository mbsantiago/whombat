"""Module for defining the AccessToken Model."""
import datetime
from uuid import UUID

import sqlalchemy.orm as orm
from fastapi_users_db_sqlalchemy.generics import GUID, TIMESTAMPAware, now_utc
from sqlalchemy import String, ForeignKey

from whombat.database.models.base import Base

__all__ = [
    "AccessToken",
]


class AccessToken(Base):
    """The AccessToken model.

    The access token model is used to store the tokens used for authentication
    and authorization. It is a subclass of the
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

    created_at: orm.Mapped[datetime.datetime] = orm.mapped_column(
        TIMESTAMPAware(timezone=True),
        index=True,
        nullable=False,
        default_factory=now_utc,
        init=False,
    )

    def __init__(self, *_, **kwargs):
        """Initialize the AccessToken model.

        Parameters
        ----------
        **kwargs
            The keyword arguments to pass to the SQLAlchemyBaseAccessTokenTableUUID
            class.

        """
        super().__init__(**kwargs)
