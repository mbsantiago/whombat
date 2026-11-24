"""Commands for managing Whombat users."""

import asyncio
import json
from collections.abc import Sequence
from getpass import getpass
from typing import Literal

from cyclopts import App
from rich.console import Console
from rich.table import Table
from sqlalchemy import or_

from whombat import api, models, schemas
from whombat.cli.common import Common

app = App(name="users", help="Manage Whombat user accounts.")


@app.command
def list(
    *,
    admins_only: bool = False,
    format: Literal["table", "json"] = "table",
    common: Common | None = None,
) -> None:
    """Show user IDs, usernames, email addresses, and admin status.

    By default, show all accounts in a readable table. Use --admins-only
    to show administrators, or --format json for machine-readable output.

    Parameters
    ----------
    admins_only
        Show only administrator accounts.
    format
        Choose a readable table or JSON output.
    """
    settings = (common or Common()).settings

    async def query_users():
        async with api.create_session(settings=settings) as session:
            filters = (
                [models.User.is_superuser.is_(True)] if admins_only else None
            )
            users, _ = await api.users.get_many(
                session, limit=None, filters=filters, sort_by="username"
            )
            return users

    rows = [
        {
            "id": str(u.id),
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_superuser,
        }
        for u in asyncio.run(query_users())
    ]
    if format == "json":
        print(json.dumps(rows, indent=2))
    else:
        _print_table(rows)


@app.command
def password(user: str, *, common: Common | None = None) -> None:
    """Set a new password for an existing user.

    Identify the account by email address or username. Enter the new password
    twice when prompted; the password is hidden while you type.

    Parameters
    ----------
    user
        Email address or username of the account to update.
    """
    settings = (common or Common()).settings

    async def resolve_user():
        async with api.create_session(settings=settings) as session:
            matches, _ = await api.users.get_many(
                session,
                limit=None,
                filters=[
                    or_(
                        models.User.email == user, models.User.username == user
                    )
                ],
                sort_by="username",
            )
            return matches

    matches = asyncio.run(resolve_user())
    email_matches = [match for match in matches if match.email == user]
    if email_matches:
        matches = email_matches
    if not matches:
        raise ValueError(f"No user found for {user!r}.")
    if len(matches) > 1:
        details = "\n".join(
            f"  {u.username} ({u.email}, {u.id})" for u in matches
        )
        raise ValueError(
            "Username matches multiple users. Use an email address:\n"
            + details
        )

    new_password = getpass("New password: ")
    if new_password != getpass("Confirm password: "):
        raise ValueError("Passwords do not match.")

    async def update_password():
        async with api.create_session(settings=settings) as session:
            await api.users.update(
                session, matches[0], schemas.UserUpdate(password=new_password)
            )
            await session.commit()

    asyncio.run(update_password())
    print(f"Password updated for {matches[0].email}.")


def _print_table(rows: Sequence[dict]) -> None:
    table = Table(title="Whombat users")
    for column in ("ID", "Username", "Email", "Admin"):
        table.add_column(column)
    for row in rows:
        table.add_row(
            row["id"],
            row["username"],
            row["email"],
            "Yes" if row["is_admin"] else "No",
        )
    Console().print(table)
