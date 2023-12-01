"""API functions to interact with notes."""

from uuid import UUID

from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common, users
from whombat.filters.base import Filter

__all__ = [
    "create",
    "delete",
    "get_by_id",
    "get_many",
    "update",
]


async def get_by_id(session: AsyncSession, note_id: int) -> schemas.Note:
    """Get a note by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    note_id : int
        The ID of the note.

    Returns
    -------
    note : schemas.notes.Note
        The note with the given id.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the given note does not exist.
    """
    note = await common.get_object(
        session, models.Note, models.Note.id == note_id
    )
    return schemas.Note.model_validate(note)


async def get_by_uuid(session: AsyncSession, uuid: UUID) -> schemas.Note:
    """Get a note by its UUID.

    Parameters
    ----------
    session
        The database session to use.
    uuid
        The UUID of the note.

    Returns
    -------
    note
        The note with the given UUID.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the given note does not exist.
    """
    note = await common.get_object(
        session,
        models.Note,
        models.Note.uuid == uuid,
    )
    return schemas.Note.model_validate(note)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.Note], int]:
    """Get all notes.

    If any of the optional parameters are given, they will be used to filter
    the notes.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    limit : int, optional
        The maximum number of notes to return.

    offset : int, optional
        The number of notes to skip.

    filters : list[whombat.filters.base.Filter], optional
        A list of filters to apply to the notes.

    sort_by : str, optional
        The field to sort the notes by.

    Returns
    -------
    notes : schemas.notes.Notes
        The requested notes.

    count : int
        The total number of notes that match the given filters.
    """
    notes, count = await common.get_objects(
        session,
        models.Note,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [schemas.Note.model_validate(note) for note in notes], count


async def create(
    session: AsyncSession,
    data: schemas.NotePostCreate,
) -> schemas.Note:
    """Create a note.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    data : schemas.notes.NoteCreate
        The data to create the note with.

    Returns
    -------
    note : schemas.notes.Note
        The created note.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the given user does not exist.
    """
    await users.get_by_id(session, user_id=data.created_by_id)
    note = await common.create_object(session, models.Note, data)
    await session.refresh(note)
    return schemas.Note.model_validate(note)


async def update(
    session: AsyncSession,
    note_id: int,
    data: schemas.NoteUpdate,
) -> schemas.Note:
    """Update a note.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    note_id : int
        The ID of the note to update.

    data:
        The data to update the note with.

    Returns
    -------
    note : schemas.notes.Note
        The updated note.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the given note does not exist.
    """
    note = await common.update_object(
        session,
        models.Note,
        models.Note.id == note_id,
        data,
    )
    return schemas.Note.model_validate(note)


async def delete(
    session: AsyncSession,
    note_id: int,
) -> None:
    """Delete a note.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    note_id : int
        The ID of the note to delete.
    """
    await common.delete_object(session, models.Note, models.Note.id == note_id)


async def from_soundevent(
    session: AsyncSession,
    note: data.Note,
) -> schemas.Note:
    """Create a note from a soundevent Note object.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.

    note : data.Note
        The soundevent Note object.

    Returns
    -------
    note : schemas.Note
        The created note.
    """
    try:
        return await get_by_uuid(session, note.uuid)
    except exceptions.NotFoundError:
        pass

    if note.created_by is None:
        user = await users.get_anonymous_user(session)
    else:
        user = await users.from_soundevent(session, note.created_by)

    return await create(
        session,
        schemas.NotePostCreate(
            created_at=note.created_on,
            uuid=note.uuid,
            message=note.message,
            created_by_id=user.id,
            is_issue=note.is_issue,
        ),
    )


def to_soundevent(
    note: schemas.Note,
) -> data.Note:
    """Create a soundevent Note object from a note.

    Parameters
    ----------
    note : schemas.Note
        The note.

    Returns
    -------
    note : data.Note
        The soundevent Note object.
    """
    user = note.created_by
    return data.Note(
        uuid=note.uuid,
        created_on=note.created_at,
        message=note.message,
        # TODO: Add other fields!
        created_by=data.User(
            uuid=user.id,
            username=user.username,
            name=user.name,
        ),
        is_issue=note.is_issue,
    )
