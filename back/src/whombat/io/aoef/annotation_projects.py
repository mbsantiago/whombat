from pathlib import Path

from soundevent.io import aoef
from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models
from whombat.api import common
from whombat.io.aoef.recordings import import_recordings
from whombat.io.aoef.tags import import_tags
from whombat.io.aoef.users import import_users


async def import_annotation_project(
    session: AsyncSession,
    obj: dict,
) -> models.AnnotationProject:
    if not isinstance(obj, dict):
        raise TypeError(f"Expected dict, got {type(obj)}")

    if not "data" in obj:
        raise ValueError("Missing 'data' key")

    data = obj["data"]
    project_object = aoef.AnnotationProjectObject.model_validate(data)

    tags = await import_tags(session, project_object.tags or [])
    users = await import_users(session, project_object.users or [])

    # get recordings

    # import all clip annotations

    # create annotation project

    # create all annotation tasks
    pass
