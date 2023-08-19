"""API functions to interact with notes."""

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models, schemas
from whombat.api import common, users
from whombat.filters.base import Filter

__all__ = [
    "create",
    "delete",
    "get_by_id",
    "get_recordings",
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


async def get_recordings(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: list[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> list[schemas.Note]:
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

    """
    notes = await common.get_objects(
        session,
        models.Note,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [schemas.Note.model_validate(note) for note in notes]


async def create(
    session: AsyncSession,
    data: schemas.NoteCreate,
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
