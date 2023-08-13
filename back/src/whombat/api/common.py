"""Common API functions."""

from typing import Any, Callable, Sequence, TypeVar

from pydantic import BaseModel
from sqlalchemy import insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute
from sqlalchemy.sql._typing import _ColumnExpressionArgument
from sqlalchemy.sql.expression import ColumnElement

from whombat import exceptions
from whombat.core.common import remove_duplicates
from whombat.database import models
from whombat.filters.base import Filter

__all__ = [
    "create_object",
    "create_objects",
    "get_object",
    "get_objects",
    "get_or_create_object",
    "delete_object",
    "update_object",
    "add_note_to_object",
    "add_tag_to_object",
    "add_feature_to_object",
    "update_feature_on_object",
    "remove_tag_from_object",
    "remove_note_from_object",
    "remove_feature_from_object",
]


A = TypeVar("A", bound=models.Base)
B = TypeVar("B", bound=BaseModel)
F = TypeVar("F", bound=models.Base)


async def get_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
) -> A:
    """Get an object by some condition.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    model : type[A]
        The model to query.
    condition : _ColumnExpressionArgument
        The condition to use.

    Returns
    -------
    A
        The object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    query = select(model).where(condition)
    result = await session.execute(query)
    obj = result.unique().scalar_one_or_none()

    if obj is None:
        raise exceptions.NotFoundError(
            "A clip with the specified condition was not found"
        )

    return obj


async def get_objects(
    session: AsyncSession,
    model: type[A],
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter | _ColumnExpressionArgument] | None = None,
    sort_by: _ColumnExpressionArgument | None = None,
) -> Sequence[A]:
    """Get all objects.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model to query.

    limit : int, optional
        The maximum number of objects to return, by default 1000

    offset : int, optional
        The offset to use, by default 0

    filters : list[Filter], optional
        A list of filters to apply, by default None

    sort_by : _ColumnExpressionArgument, optional
        The column to sort by, by default None

    Returns
    -------
    list[A]
        The objects.
    """
    query = select(model)
    for filter_ in filters or []:
        if isinstance(filter_, Filter):
            query = filter_.filter(query)
        else:
            query = query.where(filter_)
    query = query.limit(limit).offset(offset)

    if sort_by is not None:
        query = query.order_by(sort_by)

    result = await session.execute(query)
    return result.unique().scalars().all()


async def create_object(
    session: AsyncSession,
    model: type[A],
    data: BaseModel,
) -> A:
    """Create an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    model : type[A]
        The model to create.
    data : dict[str, str]
        The data to use.

    Returns
    -------
    A
        The created object.
    """
    obj = model(**data.model_dump(exclude_unset=True))
    try:
        session.add(obj)
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise exceptions.DuplicateObjectError(
            f"A {model.__name__} could not be created due to a duplicate object"
            " error. This is likely due to a unique constraint violation."
            f" Data: {data}"
        ) from e
    return obj


async def create_objects(
    session: AsyncSession,
    model: type[A],
    data: Sequence[B],
    avoid_duplicates: bool = False,
    key: Callable[[A | B], Any] | None = None,
    key_column: ColumnElement | InstrumentedAttribute | None = None,
) -> Sequence[A]:
    """Create multiple objects.

    This function should be used when creating multiple objects at once, as it
    will commit the session only once. Should be more efficient than calling
    `object_create` multiple times, specially when creating many objects.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model to create.

    data : Sequence[B]
        The data to use for creation of the objects.

    avoid_duplicates : bool, optional
        Whether to avoid creating duplicate objects, by default False
        If True, a query will be performed to check which objects already exist
        and only the ones that do not exist will be created.

    key : Callable[[A | B], Any], optional
        Only used if `avoid_duplicates` is True. A function that returns a key
        for each object. If two objects have the same key, only one will be
        created. Also this key value will be used to query the database for
        existing objects.

    key_column : InstrumentedAttribute, optional
        Only used if `avoid_duplicates` is True. The column to use for
        querying existing objects. Will raise an error if not provided
        and `avoid_duplicates` is True.

    Returns
    -------
    Sequence[A]
        The objects associated to the data. Both created and existing objects
        will be returned.

    Raises
    ------
    ValueError
        If `avoid_duplicates` is True and `key` or `key_column` are
        not provided.

    """
    if not avoid_duplicates:
        stmt = (
            insert(model)
            .values([obj.model_dump() for obj in data])
            .returning(model)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    if key is None or key_column is None:
        raise ValueError(
            "If `avoid_duplicates` is True, `key` and `key_column` must be"
            " provided"
        )

    # Remove duplicates from data
    data = remove_duplicates(list(data), key=key)

    # Get existing objects
    keys = [key(obj) for obj in data]
    existing = await get_objects(
        session,
        model,
        filters=[key_column.in_(keys)],
    )
    existing_keys = {key(obj) for obj in existing}

    # Create missing objects
    missing = [obj for obj in data if key(obj) not in existing_keys]

    if not missing:
        return existing

    values = [obj.model_dump() for obj in missing]
    stmt = insert(model).values(values)
    await session.execute(stmt)

    # Return all objects
    return await get_objects(
        session,
        model,
        filters=[key_column.in_(keys)],
    )


async def delete_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
) -> None:
    """Delete an object based on some condition.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to delete.

    condition : _ColumnExpressionArgument
        The condition to use.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)
    await session.delete(obj)
    await session.commit()


async def get_or_create_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    data: BaseModel,
) -> A:
    """Get or create an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to get or create.

    condition : _ColumnExpressionArgument
        The condition to use.

    data : BaseModel
        The data to use for creation of the object.

    Returns
    -------
    A
        The object.
    """
    try:
        return await get_object(session, model, condition)
    except exceptions.NotFoundError:
        return await create_object(session, model, data)


async def update_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    data: BaseModel,
) -> A:
    """Update an object based on some condition.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    data : BaseModel
        The data to use for update.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise exceptions.DuplicateObjectError(
            f"A {model.__name__} could not be updated due to a duplicate object"
            " error. This is likely due to a unique constraint violation."
            f" Data: {data}"
        ) from e
    return obj


async def add_note_to_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    note_id: int,
) -> A:
    """Add a note to an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    note_id : int
        The id of the note to add.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)

    if any(note.id == note_id for note in obj.notes):  # type: ignore
        return obj

    note = await get_object(session, models.Note, models.Note.id == note_id)

    # NOTE: This is a bit hacky. Here we assume that the note association models
    # and the relation fields are named in a certain way. This is not ideal,
    # but it works for now.
    name = model.__name__.lower()
    foreign_key = f"{name}_id"
    relation_field_name = f"{name}_notes"
    association_model_name = f"{model.__name__}Note"

    # Get the association model
    association_model = getattr(models, association_model_name)

    object_tag = association_model(
        **{
            "note_id": note.id,
            foreign_key: obj.id,  # type: ignore
        }
    )  # type: ignore
    getattr(obj, relation_field_name).append(object_tag)  # type: ignore
    session.add(obj)
    await session.commit()

    session.expire(obj)
    return await get_object(session, model, condition)


async def add_tag_to_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    tag_id: int,
) -> A:
    """Add a tag to an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    tag_id : int
        The id of the tag to add.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)

    # If the tag is already present, do nothing and return the object
    if any(tag.id == tag_id for tag in obj.tags):  # type: ignore
        return obj

    # Check if the tag exists
    tag = await get_object(session, models.Tag, models.Tag.id == tag_id)

    # NOTE: This is a bit hacky. Here we assume that the tag association models
    # and the relation fields are named in a certain way. This is not ideal,
    # but it works for now.
    name = model.__name__.lower()
    foreign_key = f"{name}_id"
    relation_field_name = f"{name}_tags"
    association_model_name = f"{model.__name__}Tag"

    # Get the association model
    association_model = getattr(models, association_model_name)

    object_tag = association_model(
        **{
            "tag_id": tag.id,
            foreign_key: obj.id,  # type: ignore
        }
    )  # type: ignore
    getattr(obj, relation_field_name).append(object_tag)  # type: ignore
    session.add(obj)
    await session.commit()

    session.expire(obj)
    return await get_object(session, model, condition)


async def add_feature_to_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    feature_name_id: int,
    value: float,
) -> A:
    """Add a feature to an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    feature_name_id : int
        The id of the feature name to add.

    value : float
        The value of the feature to add.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)

    if any(
        feature.feature_name_id == feature_name_id
        for feature in obj.features  # type: ignore
    ):
        return obj

    feature_name = await get_object(
        session,
        models.FeatureName,
        models.FeatureName.id == feature_name_id,
    )

    model_name = model.__name__
    feature_model_name = f"{model_name}Feature"
    foreign_key = f"{model_name.lower()}_id"
    association_model = getattr(models, feature_model_name)

    feature = association_model(
        **{
            foreign_key: obj.id,  # type: ignore
            "feature_name_id": feature_name.id,  # type: ignore
            "value": value,  # type: ignore
        }
    )
    obj.features.append(feature)  # type: ignore
    await session.commit()

    session.expire(obj)
    return await get_object(session, model, condition)


async def update_feature_on_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    feature_name_id: int,
    value: float,
) -> A:
    """Update a feature on an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    feature_name_id : int
        The id of the feature name to update.

    value : float
        The value of the feature to update.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)

    feature = next(
        (
            feature
            for feature in obj.features  # type: ignore
            if feature.feature_name_id == feature_name_id
        ),
        None,
    )

    if feature is None:
        return obj

    feature.value = value

    session.add(obj)
    await session.commit()

    session.expire(obj)
    return obj


async def remove_tag_from_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    tag_id: int,
) -> A:
    """Remove a tag from an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    tag_id : int
        The id of the tag to remove.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)

    name = model.__name__.lower()
    relation_field_name = f"{name}_tags"

    tag = next(
        (
            tag
            for tag in getattr(obj, relation_field_name)
            if tag.tag.id == tag_id
        ),
        None,
    )

    if tag is None:
        return obj

    getattr(obj, relation_field_name).remove(tag)
    session.add(obj)
    await session.commit()

    session.expire(obj)
    return await get_object(session, model, condition)


async def remove_note_from_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    note_id: int,
) -> A:
    """Remove a note from an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    note_id : int
        The id of the note to remove.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)

    name = model.__name__
    relation_field = f"{name.lower()}_notes"

    note = next(
        (
            note
            for note in getattr(obj, relation_field)
            if note.note.id == note_id
        ),
        None,
    )

    if note is None:
        return obj

    getattr(obj, relation_field).remove(note)
    session.add(obj)
    await session.commit()

    session.expire(obj)
    return await get_object(session, model, condition)


async def remove_feature_from_object(
    session: AsyncSession,
    model: type[A],
    condition: _ColumnExpressionArgument,
    feature_name_id: int,
) -> A:
    """Remove a feature from an object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    model : type[A]
        The model of the object to update.

    condition : _ColumnExpressionArgument
        The condition to use.

    feature_name_id : int
        The id of the feature name to remove.

    Returns
    -------
    A
        The updated object.

    Raises
    ------
    exceptions.NotFoundError
        If the object was not found.
    """
    obj = await get_object(session, model, condition)

    feature = next(
        (
            feature
            for feature in obj.features  # type: ignore
            if feature.feature_name_id == feature_name_id
        ),
        None,
    )

    if feature is None:
        return obj

    obj.features.remove(feature)  # type: ignore
    session.add(obj)
    await session.commit()

    session.expire(obj)
    return await get_object(session, model, condition)
