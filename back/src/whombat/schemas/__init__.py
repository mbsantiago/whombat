"""Schemas for whombat data models.

Schemas are defined using Pydantic, and are used to
validate data before it is inserted into the database, and also to
validate data before it is returned to the user.
"""

from whombat.schemas import users

__all__ = [
    "users",
]
