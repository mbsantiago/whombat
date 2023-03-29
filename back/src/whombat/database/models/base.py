"""Base class for SqlAlchemy Models.

All whombat models should inherit from this class.
"""

from sqlalchemy.orm import declarative_base

__all__ = [
    "Base"
]

Base = declarative_base()
"""Base class for SqlAlchemy Models."""
