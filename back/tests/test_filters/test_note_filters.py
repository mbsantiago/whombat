"""Test suite for User filters."""

import datetime

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, schemas
from whombat.filters import notes as note_filters


@pytest.fixture
async def user1(session: AsyncSession):
    """Create a user for testing."""
    return await api.users.create(
        session,
        username="user1",
        password="password",
        email="user1@whombat.com",
    )


@pytest.fixture
async def user2(session: AsyncSession):
    """Create a user for testing."""
    return await api.users.create(
        session,
        username="user2",
        password="password",
        email="user2@whombat.com",
    )


@pytest.fixture
async def user3(session: AsyncSession):
    """Create a user for testing."""
    return await api.users.create(
        session,
        username="user3",
        password="password",
        email="user3@whombat.com",
    )


@pytest.fixture(autouse=True)
async def notes(
    session: AsyncSession,
    user1: schemas.SimpleUser,
    user2: schemas.SimpleUser,
    user3: schemas.SimpleUser,
) -> list[schemas.Note]:
    """Create some notes for testing."""
    note1 = await api.notes.create(
        session,
        message="note1 - a",
        created_by=user1,
        is_issue=False,
    )

    note2 = await api.notes.create(
        session,
        message="note2 - a",
        created_by=user1,
        is_issue=True,
        created_on=datetime.datetime(2021, 1, 1),
    )

    note3 = await api.notes.create(
        session,
        message="note3 - b",
        created_by=user2,
    )

    note4 = await api.notes.create(
        session,
        message="note4 - b",
        created_by=user3,
    )

    return [note1, note2, note3, note4]


async def test_get_notes_that_are_issues(
    session: AsyncSession, notes: list[schemas.Note]
):
    """Test getting all notes that are issues."""
    # Act
    db_notes, _ = await api.notes.get_many(
        session,
        filters=[
            note_filters.IssueFilter(eq=True),
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
    db_notes, _ = await api.notes.get_many(
        session,
        filters=[
            note_filters.IssueFilter(eq=False),
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
    db_notes, _ = await api.notes.get_many(
        session,
        filters=[
            note_filters.CreatedByFilter(eq=user1.id),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[1] == notes[1]
    assert db_notes[0] == notes[0]


async def test_get_notes_before_date(
    session: AsyncSession,
    notes: list[schemas.Note],
):
    """Test getting all notes before a date."""
    # Act
    db_notes, _ = await api.notes.get_many(
        session,
        filters=[
            note_filters.CreatedAtFilter(before=datetime.datetime(2021, 5, 1)),
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
    db_notes, _ = await api.notes.get_many(
        session,
        filters=[
            note_filters.CreatedAtFilter(after=datetime.datetime(2021, 5, 1)),
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
    db_notes, _ = await api.notes.get_many(
        session,
        filters=[
            note_filters.MessageFilter(has="b"),
        ],
    )

    # Assert
    assert isinstance(db_notes, list)
    assert len(db_notes) == 2
    assert db_notes[0] == notes[3]
    assert db_notes[1] == notes[2]
