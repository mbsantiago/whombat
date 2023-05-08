"""Base class for SqlAlchemy Models.

All whombat models should inherit from this class.
"""

import datetime
import uuid

import sqlalchemy.orm as orm
import sqlalchemy.sql.functions as func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import CHAR, TypeDecorator

__all__ = [
    "Base",
]


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses
    CHAR(32), storing as stringified hex values.

    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return "%.32x" % uuid.UUID(value).int
            else:
                # hexstring
                return "%.32x" % value.int

    def process_result_value(self, value, _):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value


class Base(orm.DeclarativeBase):
    """Base class for SqlAlchemy Models."""

    created_at: orm.Mapped[datetime.datetime] = orm.mapped_column(
        name="created_at",
        nullable=False,
        default=datetime.datetime.now,
    )

    type_annotation_map = {
        uuid.UUID: GUID,
    }

    __mapper_args__ = {
        "eager_defaults": True,
    }
