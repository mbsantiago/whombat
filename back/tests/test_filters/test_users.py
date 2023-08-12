"""Test suite for User filters."""

import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, filters, schemas
from whombat.database import models


async def test_get_notes_that_are_issues(
    session: AsyncSession, user: schemas.User
):
    """Test getting all notes that are issues."""
    # Arrange
    await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    note2 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test2",
            created_by_id=user.id,
            is_issue=True,
        ),
    )

    # Act
    db_notes = await api.notes.get_notes(session, is_issue=True)

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
    note1 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test2",
            created_by_id=user.id,
            is_issue=True,
        ),
    )

    # Act
    db_notes = await api.notes.get_notes(session, is_issue=False)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == note1


async def test_get_notes_from_user(session: AsyncSession, user: schemas.User):
    """Test getting all notes from a user."""
    # Arrange
    another_user = await api.users.create_user(
        session,
        data=schemas.UserCreate(
            username="user",
            password="password",
            email="user@whombat.com",
        ),
    )

    note1 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    note2 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test2",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test3",
            created_by_id=another_user.id,
            is_issue=False,
        ),
    )

    # Act
    db_notes = await api.notes.get_notes(session, created_by=user.username)

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[1] == note1
    assert db_notes[0] == note2


async def test_get_notes_from_multiple_users(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes from multiple users."""
    # Arrange
    user1 = await api.users.create_user(
        session,
        data=schemas.UserCreate(
            username="user1",
            password="password",
            email="user1@whombat.com",
        ),
    )

    user2 = await api.users.create_user(
        session,
        data=schemas.UserCreate(
            username="user2",
            password="password",
            email="user2@whombat.com",
        ),
    )

    note1 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user1.id,
            is_issue=False,
        ),
    )

    note2 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test2",
            created_by_id=user2.id,
            is_issue=False,
        ),
    )

    await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test3",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Act
    db_notes = await api.notes.get_notes(
        session,
        created_by=[user1.username, user2.username],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0] == note2
    assert db_notes[1] == note1


async def test_get_notes_before_date(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes before a date."""
    # Arrange
    note1 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test1",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note1.uuid)
    )
    db_note1 = results.scalars().first()
    assert db_note1 is not None
    db_note1.created_at = datetime.datetime(2021, 1, 1)

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user,
        is_issue=False,
    )

    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note2.uuid)
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
    assert db_notes[0].uuid == note1.uuid


async def test_get_notes_created_after(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting all notes created after a date."""
    # Arrange
    note1 = await notes.create_note(
        session,
        message="test1",
        created_by=user,
        is_issue=False,
    )

    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note1.uuid)
    )
    db_note1 = results.scalars().first()
    assert db_note1 is not None
    db_note1.created_at = datetime.datetime(2021, 1, 1)

    note2 = await notes.create_note(
        session,
        message="test2",
        created_by=user,
        is_issue=False,
    )

    results = await session.execute(
        select(models.Note).where(models.Note.uuid == note2.uuid)
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
    assert db_notes[0].uuid == note2.uuid


async def test_update_note_message(
    session: AsyncSession,
    user: schemas.User,
):
    """Test updating a note's message."""
    # Arrange
    note = await notes.create_note(
        session,
        message="test",
        created_by=user,
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
        select(models.Note).where(models.Note.uuid == note.uuid)
    )
    db_note = results.scalars().first()
    assert db_note is not None
    assert db_note.message == "new message"


async def test_get_notes_by_search(
    session: AsyncSession,
    user: schemas.User,
):
    """Test getting notes by search."""
    # Arrange
    note1 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="ab",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    note2 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="bc",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="cd",
            created_by_id=user.id,
            is_issue=False,
        ),
    )

    # Act
    db_notes = await api.notes.get_notes(
        session,
        search="b",
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0].uuid == note2.uuid
    assert db_notes[1].uuid == note1.uuid
