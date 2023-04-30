"""Base class for SqlAlchemy Models.

All whombat models should inherit from this class.
"""

import sqlalchemy.orm as orm

__all__ = [
    "Base",
]


class Base(orm.DeclarativeBase):
    """Base class for SqlAlchemy Models."""
