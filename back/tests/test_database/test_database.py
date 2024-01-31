"""Test suite to check database integrity."""

import inspect

import sqlalchemy
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from whombat import models


def check_all_tables_exist(session: Session):
    """Check that all tables exist."""
    engine = session.get_bind()
    for _, cls in inspect.getmembers(models, inspect.isclass):
        if not issubclass(cls, models.Base) or cls is models.Base:
            continue

        assert sqlalchemy.inspect(engine).has_table(cls.__tablename__)


async def test_can_create_all_models(session: AsyncSession):
    """Test that all models can be created."""
    await session.run_sync(check_all_tables_exist)
