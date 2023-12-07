"""Function to initialize the database."""

from whombat import api, exceptions
from whombat.database import utils
from whombat.settings import Settings

__all__ = [
    "init_database",
]


async def init_database(settings: Settings) -> None:
    """Create the database and tables on startup."""
    engine = utils.create_db_engine(settings.db_url)
    await utils.create_db_and_tables(engine)
    async with utils.get_async_session(engine) as session:
        try:
            await api.users.get_by_email(session, settings.admin_email)
        except exceptions.NotFoundError:
            await api.users.create(
                session,
                username=settings.admin_username,
                email=settings.admin_email,
                password=settings.admin_password,
                is_superuser=True,
            )
