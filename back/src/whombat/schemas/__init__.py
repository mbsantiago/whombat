"""Schemas for Whombat data models.

The Whombat Python API returns these schemas to the user, and 
they are the main way that the user interacts with the data.

Schemas are defined using Pydantic, and are used to
validate data before it is inserted into the database, and also to
validate data before it is returned to the user.

Most database models have multiple schemas, a main schema that
is used to return data to the user, and a create and update
schema that is used to validate data before it is inserted into
the database.

"""

from whombat.schemas import users
from whombat.schemas import datasets

__all__ = [
    "users",
    "datasets",
]
