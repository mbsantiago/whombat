"""Test suite for the notes Python API module."""
from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import notes


async def test_create_note(session: AsyncSession, user: schemas.User):
    """Test creating a note."""
    # Act
    note = await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Assert
    assert isinstance(note, schemas.Note)
    assert note.created_by.id == user.id
    assert note.message == "test"
    assert note.is_issue is False

    # Make sure it is in the database
    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note.uuid)
    )
    assert results.scalar_one_or_none() is not None

    db_note = await notes.get_by_id(session, note_id=note.id)
    assert db_note == note


async def test_create_note_fails_if_username_does_not_exist(
    session: AsyncSession,
    user: schemas.User,
):
    """Test that creating a note fails if the username does not exist."""
    # Arrange
    user = schemas.User(
        id=uuid4(),
        email="test@whombat.com",  # type: ignore
        username="test",
    )

    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await notes.create(
            session,
            data=schemas.NoteCreate(
                message="test",
                created_by_id=user.id,
                is_issue=False,
            ),
        )


async def test_get_note_by_id(session: AsyncSession, user: schemas.User):
    """Test getting a note by uuid."""
    # Arrange
    note = await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Act
    db_note = await notes.get_by_id(session, note_id=note.id)

    # Assert
    assert isinstance(db_note, schemas.Note)
    assert db_note.uuid == note.uuid
    assert db_note.message == note.message
    assert db_note.is_issue == note.is_issue
    assert db_note.created_by.id == user.id
    assert db_note.created_at == note.created_at


async def test_get_note_by_uuid_fails_if_note_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a note by id fails if the note does not exist."""
    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await notes.get_by_id(session, note_id=4)


async def test_delete_note(session: AsyncSession, user: schemas.User):
    """Test deleting a note."""
    # Arrange
    note = await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Act
    await notes.delete(session, note_id=note.id)

    # Assert
    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note.uuid)
    )
    assert results.scalar_one_or_none() is None


async def test_delete_note_fails_if_note_does_not_exist(
    session: AsyncSession,
    user: schemas.User,
):
    """Test that deleting a note does not fail if the note does not exist."""
    note = schemas.Note(
        id=1,
        message="test",
        created_by_id=user.id,
        created_by=schemas.SimpleUser.model_validate(user),
    )

    # Arrange
    with pytest.raises(exceptions.NotFoundError):
        await notes.get_by_id(session, note_id=note.id)

    with pytest.raises(exceptions.NotFoundError):
        await notes.delete(
            session,
            note_id=note.id,
        )


async def test_get_notes(session: AsyncSession, user: schemas.User):
    """Test getting all notes."""
    # Arrange
    note1 = await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    note2 = await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test2",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Act
    db_notes = await notes.get_recordings(session)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0].uuid == note2.uuid
    assert db_notes[1].uuid == note1.uuid


async def test_get_notes_with_limit(session: AsyncSession, user: schemas.User):
    """Test getting all notes with a limit."""
    # Arrange
    await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    note = await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test2",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Act
    db_notes = await notes.get_recordings(session, limit=1)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note


async def test_get_notes_with_offset(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes with an offset."""
    # Arrange
    note = await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    await notes.create(
        session,
        data=schemas.NoteCreate(
            message="test2",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Act
    db_notes = await notes.get_recordings(session, offset=1)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note
