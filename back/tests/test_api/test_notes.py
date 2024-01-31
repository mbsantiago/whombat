"""Test suite for the notes Python API module."""

from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import notes


async def test_create_note(session: AsyncSession, user: schemas.SimpleUser):
    """Test creating a note."""
    # Act
    note = await notes.create(
        session,
        message="test",
        created_by=user,
        is_issue=False,
    )

    # Assert
    assert isinstance(note, schemas.Note)
    assert note.created_by is not None
    assert note.created_by.id == user.id
    assert note.message == "test"
    assert note.is_issue is False

    # Make sure it is in the database
    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note.uuid)
    )
    assert results.scalar_one_or_none() is not None

    db_note = await notes.get(session, note.uuid)
    assert db_note == note


async def test_get_note_by_uuid_fails_if_note_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a note fails if the note does not exist."""
    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await notes.get(session, pk=uuid4())


async def test_delete_note(session: AsyncSession, user: schemas.SimpleUser):
    """Test deleting a note."""
    # Arrange
    note = await notes.create(
        session,
        message="test",
        created_by=user,
        is_issue=False,
    )

    # Act
    await notes.delete(session, note)

    # Assert
    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note.uuid)
    )
    assert results.scalar_one_or_none() is None


async def test_get_notes(session: AsyncSession, user: schemas.SimpleUser):
    """Test getting all notes."""
    # Arrange
    note1 = await notes.create(
        session,
        message="test1",
        created_by=user,
        is_issue=False,
    )

    note2 = await notes.create(
        session,
        message="test2",
        created_by=user,
        is_issue=False,
    )

    # Act
    db_notes, _ = await notes.get_many(session)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0].uuid == note2.uuid
    assert db_notes[1].uuid == note1.uuid


async def test_get_notes_with_limit(
    session: AsyncSession, user: schemas.SimpleUser
):
    """Test getting all notes with a limit."""
    # Arrange
    await notes.create(
        session,
        message="test1",
        created_by=user,
        is_issue=False,
    )

    note = await notes.create(
        session,
        message="test2",
        created_by=user,
        is_issue=False,
    )

    # Act
    db_notes, _ = await notes.get_many(session, limit=1)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note


async def test_get_notes_with_offset(
    session: AsyncSession,
    user: schemas.SimpleUser,
):
    """Test getting all notes with an offset."""
    # Arrange
    note = await notes.create(
        session,
        message="test1",
        created_by=user,
        is_issue=False,
    )

    await notes.create(
        session,
        message="test2",
        created_by=user,
        is_issue=False,
    )

    # Act
    db_notes, _ = await notes.get_many(session, offset=1)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note
