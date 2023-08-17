"""Test suite for User filters."""

import datetime

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, filters, schemas


@pytest.fixture
async def user1(session: AsyncSession):
    """Create a user for testing."""
    return await api.users.create_user(
        session,
        data=schemas.UserCreate(
            username="user1",
            password="password",
            email="user1@whombat.com",
        ),
    )


@pytest.fixture
async def user2(session: AsyncSession):
    """Create a user for testing."""
    return await api.users.create_user(
        session,
        data=schemas.UserCreate(
            username="user2",
            password="password",
            email="user2@whombat.com",
        ),
    )


@pytest.fixture
async def user3(session: AsyncSession):
    """Create a user for testing."""
    return await api.users.create_user(
        session,
        data=schemas.UserCreate(
            username="user3",
            password="password",
            email="user3@whombat.com",
        ),
    )


@pytest.fixture(autouse=True)
async def notes(
    session: AsyncSession,
    user1: schemas.User,
    user2: schemas.User,
    user3: schemas.User,
) -> list[schemas.Note]:
    """Create some notes for testing."""
    note1 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="note1 - a",
            created_by_id=user1.id,
            is_issue=False,
        ),
    )

    note2 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="note2 - a",
            created_by_id=user1.id,
            is_issue=True,
            created_at=datetime.datetime(2021, 1, 1),
        ),
    )

    note3 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="note3 - b",
            created_by_id=user2.id,
        ),
    )

    note4 = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="note4 - b",
            created_by_id=user3.id,
        ),
    )

    return [note1, note2, note3, note4]


async def test_get_notes_that_are_issues(
    session: AsyncSession, notes: list[schemas.Note]
):
    """Test getting all notes that are issues."""
    # Act
    db_notes = await api.notes.get_notes(
        session,
        filters=[
            filters.notes.IssueFilter(is_true=True),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == notes[1]


async def test_get_notes_that_are_not_issues(
    session: AsyncSession,
    notes: list[schemas.Note],
):
    """Test getting all notes that are not issues."""
    # Act
    db_notes = await api.notes.get_notes(
        session,
        filters=[
            filters.notes.IssueFilter(is_true=False),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 3
    assert db_notes[0] == notes[3]
    assert db_notes[1] == notes[2]
    assert db_notes[2] == notes[0]


async def test_get_notes_from_user(
    session: AsyncSession, notes: list[schemas.Note], user1: schemas.User
):
    """Test getting all notes from a user."""
    # Act
    db_notes = await api.notes.get_notes(
        session,
        filters=[
            filters.notes.CreatedByFilter(eq=user1.id),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[1] == notes[1]
    assert db_notes[0] == notes[0]


async def test_get_notes_from_multiple_users(
    session: AsyncSession,
    user1: schemas.User,
    user2: schemas.User,
    notes: list[schemas.Note],
):
    """Test getting all notes from multiple users."""
    # Act
    db_notes = await api.notes.get_notes(
        session,
        filters=[
            filters.notes.CreatedByFilter(isin=[user1.id, user2.id]),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 3
    assert db_notes[0] == notes[2]
    assert db_notes[2] == notes[1]
    assert db_notes[1] == notes[0]


async def test_get_notes_before_date(
    session: AsyncSession,
    notes: list[schemas.Note],
):
    """Test getting all notes before a date."""
    # Act
    db_notes = await api.notes.get_notes(
        session,
        filters=[
            filters.notes.CreatedAtFilter(
                before=datetime.datetime(2021, 5, 1)
            ),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 1
    assert db_notes[0] == notes[1]


async def test_get_notes_created_after(
    session: AsyncSession,
    notes: list[schemas.Note],
):
    """Test getting all notes created after a date."""
    # Act
    db_notes = await api.notes.get_notes(
        session,
        filters=[
            filters.notes.CreatedAtFilter(after=datetime.datetime(2021, 5, 1)),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 3
    assert db_notes[0] == notes[3]
    assert db_notes[1] == notes[2]
    assert db_notes[2] == notes[0]


async def test_get_notes_by_message(
    session: AsyncSession,
    notes: list[schemas.Note],
):
    """Test getting notes by message content."""
    # Act
    db_notes = await api.notes.get_notes(
        session,
        filters=[
            filters.notes.MessageFilter(has="b"),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0] == notes[3]
    assert db_notes[1] == notes[2]
