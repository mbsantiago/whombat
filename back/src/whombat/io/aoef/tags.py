import datetime

from soundevent.io.aoef.tag import TagObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models


async def import_tags(
    session: AsyncSession,
    tags: list[TagObject],
) -> dict[int, int]:
    """Import tags from a list of dicts"""
    if not tags:
        return {}

    values = [
        {
            "key": tag.key,
            "value": tag.value,
            "created_on": datetime.datetime.now(),
        }
        for tag in tags
    ]

    stmt = select(models.Tag.id, models.Tag.key, models.Tag.value).where(
        tuple_(models.Tag.key, models.Tag.value).in_(
            {(tag.key, tag.value) for tag in tags}
        )
    )
    result = await session.execute(stmt)

    mapping = {(key, value): id for id, key, value in result.all()}

    missing = [v for v in values if (v["key"], v["value"]) not in mapping]
    if not missing:
        return {
            tag.id: mapping[(tag.key, tag.value)]
            for tag in tags
            if (tag.key, tag.value) in mapping
        }

    stmt = insert(models.Tag)
    result = await session.execute(stmt, missing)

    stmt = select(models.Tag.id, models.Tag.key, models.Tag.value).where(
        tuple_(models.Tag.key, models.Tag.value).in_(
            {(tag["key"], tag["value"]) for tag in missing}
        )
    )
    result = await session.execute(stmt)
    created = {(key, value): id for id, key, value in result.all()}
    mapping.update(created)

    return {
        tag.id: mapping[(tag.key, tag.value)]
        for tag in tags
        if (tag.key, tag.value) in mapping
    }
