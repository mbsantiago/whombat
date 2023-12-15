"""Function to initialize the database."""

from whombat import api, exceptions
from whombat.database import utils
from whombat.settings import Settings

__all__ = [
    "init_database",
]


async def init_database(settings: Settings) -> None:
    """Create the database and tables on startup."""
    db_url = utils.get_database_url(settings)
    cfg = utils.create_alembic_config(db_url)
    engine = utils.create_async_db_engine(db_url)

    async with engine.begin() as conn:
        await conn.run_sync(utils.create_or_update_db, cfg)

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
