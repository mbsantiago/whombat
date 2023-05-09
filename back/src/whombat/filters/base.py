"""Base filter classes."""

import datetime
from typing import Type, TypeVar

from pydantic import BaseModel
from sqlalchemy import Select
from sqlalchemy.orm import InstrumentedAttribute, MappedColumn

from whombat.database.models.base import Base

__all__ = [
    "Filter",
    "null_filter",
    "integer_filter",
    "float_filter",
    "string_filter",
    "boolean_filter",
    "date_filter",
    "time_filter",
    "search_filter",
]


Model = TypeVar("Model", bound=Base)


class Filter(BaseModel):
    """A filter to use on a query."""

    def filter(self, query: Select) -> Select:
        """Filter a query."""
        raise NotImplementedError


class NullFilter(Filter):
    """A filter for null values."""

    is_null: bool


def null_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[NullFilter]:
    """Create a filter for null values."""

    class _NullFilter(NullFilter):
        """A filter for non-null values."""

        def filter(self, query: Select) -> Select:
            """Filter a query."""
            if self.is_null is not None:
                if self.is_null:
                    query = query.where(field.isnot(None))
                else:
                    query = query.where(field.is_(None))

            return query

    return _NullFilter


class IntegerFilter(Filter):
    """A filter for integers."""

    eq: int | None = None
    lt: int | None = None
    gt: int | None = None


def integer_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[IntegerFilter]:
    """Create a filter for integers."""

    class _IntegerFilter(IntegerFilter):
        """A filter for equality."""

        def filter(self, query: Select) -> Select:
            """Filter the query."""
            if self.eq is not None:
                query = query.where(field == self.eq)

            if self.lt is not None:
                query = query.where(field <= self.lt)

            if self.gt is not None:
                query = query.where(field >= self.gt)

            return query

    return _IntegerFilter


class FloatFilter(Filter):
    lt: float | None = None
    gt: float | None = None


def float_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[FloatFilter]:
    """Create a filter for floats."""

    class _FloatFilter(FloatFilter):
        """A filter for a range of values."""

        def filter(self, query: Select) -> Select:
            """Filter a query."""
            if self.lt is not None:
                query = query.where(field <= self.lt)

            if self.gt is not None:
                query = query.where(field >= self.gt)

            return query

    return _FloatFilter


class DateFilter(Filter):
    before: datetime.date | None = None
    after: datetime.date | None = None
    on: datetime.date | None = None


def date_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[DateFilter]:
    """Create a filter for dates."""

    class _DateFilter(DateFilter):
        """Filter by dates."""

        before: datetime.date | None = None
        after: datetime.date | None = None
        on: datetime.date | None = None

        def filter(self, query: Select) -> Select:
            """Filter the query."""
            if self.before is not None:
                query = query.where(field <= self.before)

            if self.after is not None:
                query = query.where(field >= self.after)

            if self.on is not None:
                query = query.where(field == self.on)

            return query

    return _DateFilter


class TimeFilter(Filter):
    before: datetime.time | None = None
    after: datetime.time | None = None


def time_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[TimeFilter]:
    """Create a filter for times."""

    class _TimeFilter(TimeFilter):
        """Filter by times."""

        def filter(self, query: Select) -> Select:
            """Filter the query."""
            if self.before is not None:
                query = query.where(field <= self.before)

            if self.after is not None:
                query = query.where(field >= self.after)

            return query

    return _TimeFilter


class StringFilter(Filter):
    """Filter by strings."""

    eq: str | None = None
    has: str | None = None


def string_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[StringFilter]:
    """Create a filter for strings."""

    class _StringFilter(StringFilter):
        """Filter by strings."""

        def filter(self, query: Select) -> Select:
            """Filter the query."""
            if self.eq is not None:
                query = query.where(field == self.eq)

            if self.has is not None:
                query = query.where(field.ilike(f"%{self.has}%"))

            return query

    return _StringFilter


class SearchFilter(Filter):
    """Filter by a search term."""

    query: str


def search_filter(
    fields: list[MappedColumn | InstrumentedAttribute],
) -> Type[SearchFilter]:
    """Create a filter for searching."""

    class _SearchFilter(SearchFilter):
        """Filter by a search term."""

        def filter(self, query: Select) -> Select:
            """Filter a query."""
            term = f"%{self.query}%"
            return query.where(
                *(self.field.ilike(term) for self.field in fields)
            )

    return _SearchFilter


class BooleanFilter(Filter):
    """Filter by a boolean value."""

    is_true: bool


def boolean_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[BooleanFilter]:
    """Create a filter for booleans."""

    class _BooleanFilter(BooleanFilter):
        """Filter by a boolean value."""

        def filter(self, query: Select) -> Select:
            """Filter a query."""
            return query.where(field == self.is_true)

    return _BooleanFilter
