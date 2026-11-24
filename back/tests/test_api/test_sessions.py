"""Tests for session configuration resolution."""

import pytest
from sqlalchemy import text

from whombat import api
from whombat.exceptions import SettingsError
from whombat.system.settings import Settings


class TestCreateSession:
    async def test_explicit_url_takes_precedence_over_config(
        self, database_url
    ):
        """An explicit URL works even when the config path cannot be read."""
        async with api.create_session(
            db_url=database_url, config_path="/missing/whombat.json"
        ) as session:
            assert (await session.execute(text("SELECT 1"))).scalar_one() == 1

    async def test_url_takes_precedence_over_settings(self, database_url):
        """An explicit database URL wins over provided settings."""
        async with api.create_session(
            db_url=database_url,
            settings=Settings(db_url="sqlite+aiosqlite:///missing/invalid.db"),
        ) as session:
            paths = (await session.execute(text("PRAGMA database_list"))).all()
            assert database_url.database in [row[2] for row in paths]

    async def test_settings_take_precedence_over_config(self, database_url):
        """Provided settings win over an unreadable config file."""
        async with api.create_session(
            settings=Settings(db_url=str(database_url)),
            config_path="/missing/whombat.json",
        ) as session:
            paths = (await session.execute(text("PRAGMA database_list"))).all()
            assert database_url.database in [row[2] for row in paths]

    async def test_uses_config_path(self, tmp_path):
        """The provided settings file determines the database location."""
        db = tmp_path / "configured.db"
        config = tmp_path / "settings.json"
        config.write_text(Settings(db_name=str(db)).model_dump_json())
        async with api.create_session(config_path=config) as session:
            paths = (await session.execute(text("PRAGMA database_list"))).all()
            assert str(db) in [row[2] for row in paths]

    async def test_invalid_config_fails(self, tmp_path):
        """A malformed configuration raises a validation error."""
        config = tmp_path / "invalid.json"
        config.write_text("not json")
        with pytest.raises(SettingsError):
            async with api.create_session(config_path=config):
                pass

    async def test_missing_config_fails(self, tmp_path):
        """An unreadable configuration raises an OS error."""
        with pytest.raises(SettingsError):
            async with api.create_session(
                config_path=tmp_path / "absent.json"
            ):
                pass

    async def test_defaults_to_application_settings(
        self, database_url, monkeypatch
    ):
        """The default session uses the application's configured database."""
        from whombat.api import sessions

        monkeypatch.setattr(
            sessions,
            "get_settings",
            lambda: Settings(db_url=str(database_url)),
        )
        async with api.create_session() as session:
            paths = (await session.execute(text("PRAGMA database_list"))).all()
            assert database_url.database in [row[2] for row in paths]
