from typing import Sequence

from soundevent.io.aoef.tag import TagObject
from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.common import create_objects_without_duplicates


async def import_tags(
    session: AsyncSession,
    tags: list[TagObject],
) -> dict[int, int]:
    """Import tags from a list of dicts"""
    if not tags:
        return {}

    mapping = {(tag.key, tag.value): tag.id for tag in tags}

    db_tags = await create_objects_without_duplicates(
        session,
        models.Tag,
        [
            dict(
                key=tag.key,
                value=tag.value,
            )
            for tag in tags
        ],
        key=lambda data: (data["key"], data["value"]),
        key_column=tuple_(models.Tag.key, models.Tag.value),
        return_all=True,
    )

    return {
        mapping[(tag.key, tag.value)]: tag.id
        for tag in db_tags
        if (tag.key, tag.value) in mapping
    }
