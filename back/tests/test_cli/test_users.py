"""User command tests against an isolated Whombat database."""

import asyncio
import json
from importlib import import_module

import pytest
from sqlalchemy.engine import URL

from whombat import api
from whombat.cli import users as cli
from whombat.cli.app import app as root_app
from whombat.system.settings import Settings


@pytest.fixture(name="_users_db")
def users_db(database_url: URL, monkeypatch):
    """Populate the test database through the Python API."""

    async def populate():
        async with api.create_session(db_url=database_url) as session:
            admin = await api.users.create(
                session,
                username="admin",
                email="admin@example.com",
                password="initial",
                is_superuser=True,
            )
            member = await api.users.create(
                session,
                username="member",
                email="member@example.com",
                password="initial",
            )
            await session.commit()
            return admin.id, member.id

    monkeypatch.setattr(
        import_module("whombat.cli.common"),
        "get_settings",
        lambda: Settings(db_url=str(database_url)),
    )
    return asyncio.run(populate())


class TestUsersList:
    def test_json_filters_admins_only(self, _users_db, capsys):
        """Admin-only JSON output lists the selected account's public fields."""
        admin_id, _ = _users_db
        with pytest.raises(SystemExit) as exit_info:
            root_app(["users", "list", "--admins-only", "--format", "json"])
        assert exit_info.value.code == 0
        assert json.loads(capsys.readouterr().out) == [
            {
                "id": str(admin_id),
                "username": "admin",
                "email": "admin@example.com",
                "is_admin": True,
            }
        ]

    def test_table_lists_all_users(self, _users_db, capsys):
        """The default table shows both accounts and their admin status."""
        with pytest.raises(SystemExit) as exit_info:
            root_app(["users", "list"])
        assert exit_info.value.code == 0
        output = capsys.readouterr().out
        assert "admin@example.com" in output
        assert "member@example.com" in output
        assert "Yes" in output and "No" in output


class TestUsersPassword:
    def test_rejects_mismatched_confirmation(self, _users_db, monkeypatch):
        """A mismatched confirmation reports an error."""
        prompts = iter(["first", "second"])
        monkeypatch.setattr(cli, "getpass", lambda _prompt: next(prompts))
        with pytest.raises(ValueError, match="Passwords do not match"):
            root_app(["users", "password", "member@example.com"])

    def test_updates_password_by_username(
        self, _users_db, database_url, monkeypatch, capsys
    ):
        """A confirmed password replaces the user's login credential."""
        monkeypatch.setattr(cli, "getpass", lambda _prompt: "new-secret")
        with pytest.raises(SystemExit) as exit_info:
            root_app(["users", "password", "member"])
        assert exit_info.value.code == 0
        assert "member@example.com" in capsys.readouterr().out

        async def verify():
            async with api.create_session(db_url=database_url) as session:
                from whombat import models
                from whombat.system.users import UserDatabase, UserManager

                manager = UserManager(UserDatabase(session, models.User))
                user = await manager.get_by_username("member")
                assert manager.password_helper.verify_and_update(
                    "new-secret", user.hashed_password
                )[0]

        asyncio.run(verify())

    def test_missing_user_reports_error(self, _users_db):
        """A missing selector is rejected before asking for a password."""
        with pytest.raises(ValueError, match="No user found"):
            root_app(["users", "password", "missing@example.com"])
