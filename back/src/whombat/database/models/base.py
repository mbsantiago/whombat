"""Base class for SqlAlchemy Models.

All whombat models should inherit from this class.
"""

import datetime
import uuid

import sqlalchemy.orm as orm
from fastapi_users_db_sqlalchemy.generics import GUID

__all__ = [
    "Base",
]


class Base(orm.MappedAsDataclass, orm.DeclarativeBase):
    """Base class for SqlAlchemy Models."""

    created_at: orm.Mapped[datetime.datetime] = orm.mapped_column(
        name="created_at",
        nullable=False,
        init=False,
        default_factory=datetime.datetime.now,
    )

    # Add a type annotation map to allow for custom types.
    type_annotation_map = {
        uuid.UUID: GUID,
    }

    # This is needed to make the default values work with
    # async sqlalchemy.
    __mapper_args__ = {
        "eager_defaults": True,
    }
