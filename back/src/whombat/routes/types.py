"""Common types for the API."""

from typing import Annotated

from fastapi import Query

__all__ = [
    "Limit",
    "Offset",
]

MAX_PAGE_SIZE = 10000

Limit = Annotated[
    int,
    Query(ge=-1, le=MAX_PAGE_SIZE),
]


Offset = Annotated[
    int,
    Query(ge=0),
]
