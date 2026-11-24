"""Tests for the top-level CLI configuration option."""

import asyncio
import json
from importlib import import_module

import pytest

from whombat import api
from whombat.cli.app import app as cli
from whombat.system.settings import Settings


class TestConfiguration:
    def test_explicit_config_selects_user_database(
        self, database_url, capsys, tmp_path, monkeypatch
    ):
        """Listing users reads the database selected by the root option."""

        async def populate():
            async with api.create_session(db_url=database_url) as session:
                await api.users.create(
                    session,
                    username="selected",
                    email="selected@example.com",
                    password="initial",
                )
                await session.commit()

        asyncio.run(populate())
        config = tmp_path / "whombat.json"
        config.write_text(Settings(db_url=str(database_url)).model_dump_json())
        module = import_module("whombat.cli.common")
        monkeypatch.setattr(
            module,
            "get_settings",
            lambda: Settings(db_url="sqlite+aiosqlite://"),
        )
        with pytest.raises(SystemExit) as result:
            cli(
                [
                    "users",
                    "list",
                    "--config-path",
                    str(config),
                    "--format",
                    "json",
                ]
            )
        assert result.value.code == 0
        assert (
            json.loads(capsys.readouterr().out)[0]["email"]
            == "selected@example.com"
        )

    def test_explicit_config_selects_web_server_port(
        self, tmp_path, monkeypatch
    ):
        """The no-command invocation launches on the configured port."""
        module = import_module("whombat.cli.app")
        config = tmp_path / "whombat.json"
        config.write_text(Settings(port=8123).model_dump_json())
        monkeypatch.setattr(
            import_module("whombat.cli.common"),
            "get_settings",
            lambda: Settings(port=5000),
        )
        calls = []
        monkeypatch.setattr(
            module.uvicorn,
            "run",
            lambda *_args, **kwargs: calls.append(kwargs),
        )
        with pytest.raises(SystemExit) as result:
            cli(["--config-path", str(config)])
        assert result.value.code == 0
        assert calls[0]["port"] == 8123
