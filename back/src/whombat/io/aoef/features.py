from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.common import create_objects_without_duplicates


async def import_feature_names(
    session: AsyncSession,
    names: list[str],
) -> dict[str, int]:
    """Import a set of recordings in AOEF format into the database."""
    if not names:
        return {}

    db_names = await create_objects_without_duplicates(
        session=session,
        model=models.FeatureName,
        data=[{"name": name} for name in names],
        key=lambda x: x["name"],
        key_column=models.FeatureName.name,
        return_all=True,
    )

    return {name.name: name.id for name in db_names}
