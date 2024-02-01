"""Test suite for migrations and database creation."""

from pathlib import Path

import pytest
from sqlalchemy.engine import URL

from whombat.system import database
from whombat.system.settings import Settings


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    """Create a temporary database file."""
    return tmp_path / "newdb.db"


@pytest.fixture
def db_url(db_path: Path) -> URL:
    """Create a temporary settings file."""
    settings = Settings(db_name=str(db_path))
    return database.get_database_url(settings)


def test_can_detect_database_that_needs_creation(db_path: Path, db_url: URL):
    """Test that we can detect a database that needs creation."""

    assert not db_path.exists()

    cfg = database.create_alembic_config(db_url, is_async=False)
    engine = database.create_sync_db_engine(db_url)

    with engine.connect() as conn:
        assert (
            database.get_db_state(conn, cfg)
            == database.DatabaseState.NEEDS_CREATION
        )


def test_can_detect_database_is_ok(db_path: Path, db_url: URL):
    """Test that we can detect a database that needs creation."""

    assert not db_path.exists()

    cfg = database.create_alembic_config(db_url, is_async=False)

    engine = database.create_sync_db_engine(db_url)
    with engine.connect() as conn:
        database.create_or_update_db(conn, cfg)

    engine = database.create_sync_db_engine(db_url)
    with engine.connect() as conn:
        assert database.get_db_state(conn, cfg) == database.DatabaseState.OK


def test_can_create_database(
    db_url: URL,
    db_path: Path,
):
    """Test that we can create a database."""

    assert not db_path.exists()

    cfg = database.create_alembic_config(db_url, is_async=False)
    engine = database.create_sync_db_engine(db_url)

    with engine.connect() as conn:
        database.create_or_update_db(conn, cfg)

    # Check that the database file exists
    assert db_path.exists()
