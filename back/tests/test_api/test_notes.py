"""Test suite for the notes Python API module."""
import datetime

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, schemas
from whombat.api import notes, users
from whombat.database import models


async def test_create_note(session: AsyncSession, user: schemas.User):
    """Test creating a note."""
    # Act
    note = await notes.create_note(
        session,
        message="test",
        created_by=user.username,
        is_issue=False,
    )

    # Assert
    assert isinstance(note, schemas.Note)
    assert note.created_by == user.username
    assert note.message == "test"
    assert note.is_issue is False

    # Make sure it is in the database
    results = await session.execute(
        select(models.Note).where(models.Note.id == note.id)
    )
    assert results.scalar_one_or_none() is not None

    db_note = await notes.get_note_by_id(session, id=note.id)
    assert db_note == note


async def test_get_note_by_id(session: AsyncSession, user: schemas.User):
    """Test getting a note by id."""
    # Arrange
    note = await notes.create_note(
        session,
        message="test",
        created_by=user.username,
        is_issue=False,
    )

    # Act
    db_note = await notes.get_note_by_id(session, id=note.id)

    # Assert
    assert isinstance(db_note, schemas.Note)
    assert db_note.id == note.id
    assert db_note.message == note.message
    assert db_note.is_issue == note.is_issue
    assert db_note.created_by == user.username
    assert db_note.created_at == note.created_at


async def test_get_note_by_id_fails_if_note_does_not_exist(
    session: AsyncSession,
):
    """Test that getting a note by id fails if the note does not exist."""
    # Act / Assert
    with pytest.raises(exceptions.NotFoundError):
        await notes.get_note_by_id(session, id=999)


async def test_delete_note(session: AsyncSession, user: schemas.User):
    """Test deleting a note."""
    # Arrange
    note = await notes.create_note(
        session,
        message="test",
        created_by=user.username,
        is_issue=False,
    )

    # Act
    await notes.delete_note(session, note=note)

    # Assert
    results = await session.execute(
        select(models.Note).where(models.Note.id == note.id)
    )
    assert results.scalar_one_or_none() is None


async def test_delete_note_does_not_fail_if_note_does_not_exist(
    session: AsyncSession,
):
    """Test that deleting a note does not fail if the note does not exist."""
    # Arrange
    note = schemas.Note(
        id=999,
        message="test",
        created_by="test",
        is_issue=False,
    )

    with pytest.raises(exceptions.NotFoundError):
        await notes.get_note_by_id(session, id=note.id)

    await notes.delete_note(
        session,
        note=note,
    )


async def test_get_notes(session: AsyncSession, user: schemas.User):
    """Test getting all notes."""
    # Arrange
    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=False,
    )

    # Act
    db_notes = await notes.get_notes(session)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0] == note1
    assert db_notes[1] == note2


async def test_get_notes_with_limit(session: AsyncSession, user: schemas.User):
    """Test getting all notes with a limit."""
    # Arrange
    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=False,
    )

    # Act
    db_notes = await notes.get_notes(session, limit=1)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note1


async def test_get_notes_with_offset(
    session: AsyncSession, user: schemas.User
):
    """Test getting all notes with an offset."""
    # Arrange
    await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=False,
    )

    # Act
    db_notes = await notes.get_notes(session, offset=1)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note2


async def test_get_notes_that_are_issues(
    session: AsyncSession, user: schemas.User
):
    """Test getting all notes that are issues."""
    # Arrange
    await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=True,
    )

    # Act
    db_notes = await notes.get_notes(session, is_issue=True)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note2


async def test_get_notes_that_are_not_issues(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes that are not issues."""
    # Arrange
    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=True,
    )

    # Act
    db_notes = await notes.get_notes(session, is_issue=False)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note1


async def test_get_notes_from_user(session: AsyncSession, user: schemas.User):
    """Test getting all notes from a user."""
    # Arrange
    another_user = await users.create_user(
        session,
        username="user",
        password="password",
        email="user@whombat.com",
    )

    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=False,
    )

    await notes.create_note(
        session,
        message="test3",
        created_by=another_user.username,
        is_issue=False,
    )

    # Act
    db_notes = await notes.get_notes(session, created_by=user.username)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0] == note1
    assert db_notes[1] == note2


async def test_get_notes_from_multiple_users(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes from multiple users."""
    # Arrange
    user1 = await users.create_user(
        session,
        username="user1",
        password="password",
        email="user1@whombat.com",
    )

    user2 = await users.create_user(
        session,
        username="user2",
        password="password",
        email="user2@whombat.com",
    )

    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user1.username,
        is_issue=False,
    )

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user2.username,
        is_issue=False,
    )

    await notes.create_note(
        session,
        message="test3",
        created_by=user.username,
        is_issue=False,
    )

    # Act
    db_notes = await notes.get_notes(
        session,
        created_by=[user1.username, user2.username],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0] == note1
    assert db_notes[1] == note2


async def test_get_notes_before_date(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes before a date."""
    # Arrange
    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    results = await session.execute(
        select(models.Note).where(models.Note.id == note1.id)
    )
    db_note1 = results.scalars().first()
    assert db_note1 is not None
    db_note1.created_at = datetime.datetime(2021, 1, 1)

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=False,
    )

    results = await session.execute(
        select(models.Note).where(models.Note.id == note2.id)
    )
    db_note2 = results.scalars().first()
    assert db_note2 is not None
    db_note2.created_at = datetime.datetime(2021, 1, 3)

    session.add_all([db_note1, db_note2])
    await session.commit()

    # Act
    db_notes = await notes.get_notes(
        session,
        created_before=datetime.datetime(2021, 1, 2),
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0].id == note1.id


async def test_get_notes_created_after(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes created after a date."""
    # Arrange
    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user.username,
        is_issue=False,
    )

    results = await session.execute(
        select(models.Note).where(models.Note.id == note1.id)
    )
    db_note1 = results.scalars().first()
    assert db_note1 is not None
    db_note1.created_at = datetime.datetime(2021, 1, 1)

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user.username,
        is_issue=False,
    )

    results = await session.execute(
        select(models.Note).where(models.Note.id == note2.id)
    )
    db_note2 = results.scalars().first()
    assert db_note2 is not None
    db_note2.created_at = datetime.datetime(2021, 1, 3)

    session.add_all([db_note1, db_note2])
    await session.commit()

    # Act
    db_notes = await notes.get_notes(
        session,
        created_after=datetime.datetime(2021, 1, 2),
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0].id == note2.id


async def test_update_note_message(
    session: AsyncSession,
    user: schemas.User,
):
    """Test updating a note's message."""
    # Arrange
    note = await notes.create_note(
        session,
        message="test",
        created_by=user.username,
        is_issue=False,
    )

    # Act
    await notes.update_note(
        session,
        note=note,
        message="new message",
    )

    # Assert
    results = await session.execute(
        select(models.Note).where(models.Note.id == note.id)
    )
    db_note = results.scalars().first()
    assert db_note is not None
    assert db_note.message == "new message"
