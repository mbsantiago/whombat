"""API functions to interact with notes."""

import datetime
from uuid import UUID

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.database import models
from whombat.schemas.notes import NoteCreate, NoteUpdate

__all__ = [
    "create_note",
    "delete_note",
    "get_note_by_uuid",
    "get_notes",
    "update_note",
]


async def create_note(
    session: AsyncSession,
    message: str,
    created_by: schemas.User,
    is_issue: bool = False,
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
    data = NoteCreate(
        message=message,
        created_by=created_by.username,
        is_issue=is_issue,
    )

    # Check if the user exists.
    query = select(models.User.id).where(
        models.User.id == created_by.id  # type: ignore
    )
    result = await session.execute(query)
    row = result.one_or_none()
    if row is None:
        raise exceptions.NotFoundError(
            f"User with ID {created_by.id} does not exist.",
        )

    db_note = models.Note(
        message=data.message,
        is_issue=data.is_issue,
        created_by_id=created_by.id,
    )

    session.add(db_note)
    await session.commit()

    return schemas.Note(
        uuid=db_note.uuid,
        message=db_note.message,
        is_issue=db_note.is_issue,
        created_by=data.created_by,
        created_at=db_note.created_at,
    )


async def get_note_by_uuid(
    session: AsyncSession,
    uuid: UUID,
) -> schemas.Note:
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
    query = (
        select(models.Note, models.User)
        .join(models.Note.created_by)
        .where(models.Note.uuid == uuid)
    )
    result = await session.execute(query)
    row = result.one_or_none()

    if row is None:
        raise exceptions.NotFoundError(
            f"Note with ID {uuid} does not exist.",
        )

    note, user = row
    return schemas.Note(
        uuid=note.uuid,
        message=note.message,
        is_issue=note.is_issue,
        created_by=user.username,
        created_at=note.created_at,
    )


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
    created_by: list[str] | str | None = None,
    is_issue: bool | None = None,
    created_before: datetime.datetime | None = None,
    created_after: datetime.datetime | None = None,
    search: str | None = None,
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
    query = select(models.Note, models.User.username).join(
        models.Note.created_by
    )

    if created_by is not None:
        if isinstance(created_by, str):
            created_by = [created_by]

        query = query.where(
            models.Note.created_by.has(
                models.User.username.in_(created_by),
            )
        )

    if is_issue is not None:
        query = query.where(models.Note.is_issue == is_issue)

    if created_before is not None:
        query = query.where(models.Note.created_at < created_before)

    if created_after is not None:
        query = query.where(models.Note.created_at > created_after)

    if search is not None:
        query = query.where(models.Note.message.ilike(f"%{search}%"))

    query = (
        query.limit(limit)
        .offset(offset)
        .order_by(models.Note.created_at.desc())
    )

    result = await session.execute(query)
    return [
        schemas.Note(
            uuid=note.uuid,
            message=note.message,
            is_issue=note.is_issue,
            created_by=user,
            created_at=note.created_at,
        )
        for note, user in result.all()
    ]


async def update_note(
    session: AsyncSession,
    note: schemas.Note,
    message: str | None = None,
    is_issue: bool | None = None,
) -> schemas.Note:
    """Update a note.

    Parameters
    ----------
    session : AsyncSession
        The database session to use.
    note : schemas.notes.Note
        The note to update.
    message : str | None, optional
        The new message of the note.
    is_issue : bool | None, optional
        Whether the note is an issue.

    Returns
    -------
    note : schemas.notes.Note
        The updated note.

    Raises
    ------
    whombat.exceptions.NotFoundError
        If the given note does not exist.

    """
    data = NoteUpdate(
        message=message,
        is_issue=is_issue,
    )

    query = (
        update(models.Note)
        .where(models.Note.uuid == note.uuid)
        .values(
            **data.dict(exclude_none=True),
        )
    )

    await session.execute(query)
    await session.commit()

    return schemas.Note(
        **{
            **note.dict(),
            **data.dict(exclude_none=True),
        }
    )
