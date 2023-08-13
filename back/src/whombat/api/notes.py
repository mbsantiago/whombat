"""API functions to interact with notes."""

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import common, users
from whombat.database import models
from whombat.filters.base import Filter

__all__ = [
    "create_note",
    "delete_note",
    "get_note_by_id",
    "get_notes",
    "update_note",
]


async def create_note(
    session: AsyncSession,
    data: schemas.NoteCreate,
) -> schemas.Note:
    """Create a note.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    message : str
        The message of the note.
    created_by : schemas.users.User
        The user who created the note.
    is_issue : bool
        Whether the note is an issue.

    Returns
    -------
    note : schemas.notes.Note
        The created note.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the given user does not exist.

    """
    try:
        await users.get_user_by_id(session, user_id=data.created_by_id)
    except exceptions.NotFoundError as e:
        raise exceptions.NotFoundError(
            f"User with ID {data.created_by_id} does not exist.",
        ) from e

    db_note = models.Note(**data.model_dump(exclude_unset=True))
    session.add(db_note)
    await session.commit()
    return await get_note_by_id(session, db_note.id)


async def get_note_by_id(session: AsyncSession, note_id: int) -> schemas.Note:
    """Get a note by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    id : int
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


async def delete_note(
    session: AsyncSession,
    note: schemas.Note,
) -> None:
    """Delete a note.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    note : schemas.notes.Note
        The note to delete.

    Note
    ----
    The function will not raise an error if the given note does not exist.
    """
    await common.delete_object(session, models.Note, models.Note.id == note.id)


async def get_notes(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: list[Filter] | None = None,
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
        sort_by=models.Note.created_at.desc(),
    )
    return [schemas.Note.model_validate(note) for note in notes]


async def update_note(
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
