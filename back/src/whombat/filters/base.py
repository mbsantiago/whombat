"""Base filter classes."""

import datetime
from abc import ABC, abstractmethod
from collections import defaultdict
from typing import Type, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, create_model
from pydantic.fields import FieldInfo
from sqlalchemy import Select, or_
from sqlalchemy.orm import InstrumentedAttribute, MappedColumn

from whombat.models.base import Base

__all__ = [
    "Filter",
    "boolean_filter",
    "date_filter",
    "float_filter",
    "integer_filter",
    "optional_boolean_filter",
    "optional_date_filter",
    "optional_float_filter",
    "optional_integer_filter",
    "optional_string_filter",
    "optional_time_filter",
    "search_filter",
    "string_filter",
    "time_filter",
    "uuid_filter",
]


Model = TypeVar("Model", bound=Base)


def le_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: int | float | datetime.date | datetime.time,
) -> Select:
    """Filter a query by a less than or equal to condition."""
    return query.where(field <= value)


def lt_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: int | float | datetime.date | datetime.time,
) -> Select:
    """Filter a query by a less than condition."""
    return query.where(field < value)


def ge_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: int | float | datetime.date | datetime.time,
) -> Select:
    """Filter a query by a greater than or equal to condition."""
    return query.where(field >= value)


def gt_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: int | float | datetime.date | datetime.time,
) -> Select:
    """Filter a query by a greater than condition."""
    return query.where(field > value)


def is_null_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: bool,
) -> Select:
    """Filter a query by a null condition."""
    if value:
        return query.where(field.is_(None))
    return query.where(field.isnot(None))


def eq_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: int | float | str | bool | datetime.date | datetime.time,
) -> Select:
    """Filter a query by an equality condition."""
    return query.where(field == value)


def has_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: str,
) -> Select:
    """Filter a query by a has condition."""
    return query.where(field.ilike(f"%{value}%"))


def isin_filter(
    query: Select,
    field: MappedColumn | InstrumentedAttribute,
    value: list[int | float | str | bool | datetime.date | datetime.time],
) -> Select:
    """Filter a query by an isin condition."""
    return query.where(field.in_(value))


class Filter(ABC, BaseModel):
    """A filter to use on a query."""

    model_config = ConfigDict(protected_namespaces=())

    _filter_mapping = {
        "eq": eq_filter,
        "le": le_filter,
        "ge": ge_filter,
        "lt": lt_filter,
        "gt": gt_filter,
        "is_true": eq_filter,
        "is_null": is_null_filter,
        "has": has_filter,
        "before": lt_filter,
        "after": gt_filter,
        "on": eq_filter,
        "isin": isin_filter,
    }

    @abstractmethod
    def filter(self, query: Select) -> Select:
        """Filter a query."""
        ...


F = TypeVar("F", bound=Filter)


def create_filter_from_field_and_model(
    field: MappedColumn | InstrumentedAttribute,
    model: Type[F],
) -> Type[F]:
    """Create a filter from a field and model."""

    class _Filter(model):
        """A filter for a field."""

        def filter(self, query: Select) -> Select:
            """Filter the query."""
            for field_name in model.model_fields:
                value = getattr(self, field_name)
                if value is None:
                    continue

                filter_fn = self._filter_mapping[field_name]
                query = filter_fn(query, field, value)

            return query

    return _Filter  # type: ignore


class IntegerFilter(Filter):
    """A filter for integers."""

    eq: int | None = None
    le: int | None = None
    ge: int | None = None
    lt: int | None = None
    gt: int | None = None


def integer_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[IntegerFilter]:
    """Create a filter for integers."""
    return create_filter_from_field_and_model(field, IntegerFilter)


class OptionalIntegerFilter(Filter):
    """A filter for integers."""

    eq: int | None = None
    le: int | None = None
    ge: int | None = None
    lt: int | None = None
    gt: int | None = None
    is_null: bool | None = None


def optional_integer_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[OptionalIntegerFilter]:
    """Create a filter for an optional integer column."""
    return create_filter_from_field_and_model(field, OptionalIntegerFilter)


class FloatFilter(Filter):
    lt: float | None = None
    gt: float | None = None
    le: float | None = None
    ge: float | None = None


def float_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[FloatFilter]:
    """Create a filter for floats."""
    return create_filter_from_field_and_model(field, FloatFilter)


class OptionalFloatFilter(Filter):
    """A filter for optional floats."""

    lt: float | None = None
    gt: float | None = None
    le: float | None = None
    ge: float | None = None
    is_null: bool | None = None


def optional_float_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[OptionalFloatFilter]:
    """Create a filter for optional floats."""
    return create_filter_from_field_and_model(field, OptionalFloatFilter)


class DateFilter(Filter):
    before: datetime.date | None = None
    after: datetime.date | None = None
    on: datetime.date | None = None


def date_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[DateFilter]:
    """Create a filter for dates."""
    return create_filter_from_field_and_model(field, DateFilter)


class OptionalDateFilter(Filter):
    before: datetime.date | None = None
    after: datetime.date | None = None
    on: datetime.date | None = None
    is_null: bool | None = None


def optional_date_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[OptionalDateFilter]:
    """Create a filter for optional dates."""
    return create_filter_from_field_and_model(field, OptionalDateFilter)


class TimeFilter(Filter):
    before: datetime.time | None = None
    after: datetime.time | None = None


def time_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[TimeFilter]:
    """Create a filter for times."""
    return create_filter_from_field_and_model(field, TimeFilter)


class OptionalTimeFilter(Filter):
    before: datetime.time | None = None
    after: datetime.time | None = None
    is_null: bool | None = None


def optional_time_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[OptionalTimeFilter]:
    """Create a filter for optional times."""
    return create_filter_from_field_and_model(field, OptionalTimeFilter)


class StringFilter(Filter):
    """Filter by strings."""

    eq: str | None = None
    has: str | None = None


def string_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[StringFilter]:
    """Create a filter for strings."""
    return create_filter_from_field_and_model(field, StringFilter)


class OptionalStringFilter(Filter):
    """Filter by strings."""

    eq: str | None = None
    has: str | None = None
    is_null: bool | None = None


def optional_string_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[OptionalStringFilter]:
    """Create a filter for optional strings."""
    return create_filter_from_field_and_model(field, OptionalStringFilter)


class UUIDFilter(Filter):
    """Filter by UUIDs."""

    eq: UUID | None = None

    isin: list[UUID] | None = None


def uuid_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[UUIDFilter]:
    """Create a filter for UUIDs."""
    return create_filter_from_field_and_model(field, UUIDFilter)


class BooleanFilter(Filter):
    """Filter by a boolean value."""

    eq: bool | None = None


def boolean_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[BooleanFilter]:
    """Create a filter for booleans."""
    return create_filter_from_field_and_model(field, BooleanFilter)


class OptionalBooleanFilter(Filter):
    """Filter by a boolean value."""

    is_true: bool | None = None
    is_null: bool | None = None


def optional_boolean_filter(
    field: MappedColumn | InstrumentedAttribute,
) -> Type[OptionalBooleanFilter]:
    """Create a filter for optional booleans."""
    return create_filter_from_field_and_model(field, OptionalBooleanFilter)


class SearchFilter(Filter):
    """Filter by a search term."""

    search: str | None = None


def search_filter(
    fields: list[MappedColumn | InstrumentedAttribute],
) -> type[SearchFilter]:
    """Create a filter for searching."""

    class _SearchFilter(SearchFilter):
        """Filter by a search term."""

        def filter(self, query: Select) -> Select:
            """Filter a query."""
            term = f"%{self.search}%"
            return query.where(or_(*[field.ilike(term) for field in fields]))

    return _SearchFilter


def combine(
    *filters: type[Filter],
    **named_filters: type[Filter],
) -> type[Filter]:
    """Combine filters into a single filter.

    This function can be used to combine multiple filters into a single
    pydantic model. This is useful as it allows you to use the combined filter
    as a FastAPI dependency, and it will deserialize the query parameters into
    the correct filter types and apply them to the query.
    """
    field_definitions: dict[str, tuple[type, FieldInfo]] = {}
    field_mapping: dict[str, str] = {}
    filter_mapping: dict[str, int] = {}

    filter_list = list(filters) + list(named_filters.values())
    items = [("", filter) for filter in filters] + list(named_filters.items())

    for filter_num, (prefix, filter) in enumerate(items):
        for original_field_name, field in filter.model_fields.items():
            if prefix != "":
                field_name = f"{prefix}__{original_field_name}"
            else:
                field_name = original_field_name

            if field_name in field_definitions:
                raise ValueError(
                    "Cannot combine filters with the same field name."
                    " If you want to combine filters with the same field name,"
                    " use it as a named filter to add a prefix to the field"
                    " name."
                )

            if field.annotation is None:
                raise ValueError(
                    "All filter fields must have an annotation."
                    f" Missing annotation for field {original_field_name} of"
                    f" filter {filter}."
                )

            field_definitions[field_name] = (
                field.annotation,
                field,
            )

            field_mapping[field_name] = original_field_name
            filter_mapping[field_name] = filter_num

    combined_model = create_model(
        "CombinedFilter",
        __base__=Filter,
        **field_definitions,  # type: ignore
    )

    class CombinedFilter(combined_model):
        """The combined filter."""

        def __init__(self, **kwargs):
            super().__init__(**kwargs)
            self.__filters: list[Filter] = self.build_filter_list()

        def build_filter_list(self) -> list[Filter]:
            """Build a list of filters."""
            filter_args_mapping = defaultdict(dict)

            for field_name, value in dict(self).items():
                if value is None:
                    continue

                filter_num = filter_mapping[field_name]
                original_field_name = field_mapping[field_name]
                filter_args_mapping[filter_num][original_field_name] = value

            filters = []
            for filter_num, filter_args in filter_args_mapping.items():
                if not filter_args:
                    continue

                filter_type = filter_list[filter_num]
                filters.append(filter_type(**filter_args))

            return filters

        def filter(self, query: Select) -> Select:
            """Filter the query."""
            for filter_ in self.__filters:
                query = filter_.filter(query)

            return query

    return CombinedFilter
