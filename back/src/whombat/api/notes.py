"""API functions to interact with notes."""

import sqlalchemy.orm as orm
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import users
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

    db_note = models.Note(**data.model_dump())
    session.add(db_note)
    await session.commit()
    return await get_note_by_id(session, db_note.id)


async def _get_note(session: AsyncSession, note_id: int) -> models.Note:
    """Get a note by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    id : int
        The ID of the note.

    Returns
    -------
    note : models.notes.Note
        The note with the given id.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the given note does not exist.

    """
    query = select(models.Note).where(models.Note.id == note_id)
    result = await session.execute(query)
    row = result.scalar_one_or_none()
    if row is None:
        raise exceptions.NotFoundError(
            f"Note with ID {note_id} does not exist.",
        )
    return row


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
    row = await _get_note(session, note_id)
    return schemas.Note.model_validate(row)


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
    query = delete(models.Note).where(models.Note.uuid == note.uuid)
    await session.execute(query)
    await session.commit()


async def get_notes(
    session: AsyncSession,
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
    created_by: list[str] | str | None, optional
        The usernames of the users who created the notes. If a list is given,
        the notes will be filtered to only include notes created by the given
        users. If a string is given, the notes will be filtered to only include
        notes created by the given user.
    is_issue : bool | None, optional
        Whether the notes are issues. If True, only notes that are issues will
        be returned. If False, only notes that are not issues will be returned.
    created_before : datetime.datetime | None, optional
        Only notes created before this time will be returned.
    created_after : datetime.datetime | None, optional
        Only notes created after this time will be returned.
    search : str | None, optional
        Only notes that contain this string in their message will be returned.

    Returns
    -------
    notes : schemas.notes.Notes
        The requested notes.

    """
    query = select(models.Note).options(orm.joinedload(models.Note.created_by))

    for filter_ in filters or []:
        query = filter_.filter(query)

    query = (
        query.limit(limit)
        .offset(offset)
        .order_by(models.Note.created_at.desc())
    )

    result = await session.execute(query)
    return [schemas.Note.model_validate(note) for note in result.scalars()]


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
    db_note = await _get_note(session, note_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_note, field, value)

    await session.commit()
    return schemas.Note.model_validate(db_note)
