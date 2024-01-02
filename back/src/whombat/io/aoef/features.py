import datetime

from soundevent.geometry import GeometricFeature
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.io.aoef.common import AOEFObject


async def get_feature_names(
    session: AsyncSession,
    obj: AOEFObject,
) -> dict[str, int]:
    names: set[str] = set(feat.value for feat in GeometricFeature)

    recordings = getattr(obj, "recordings", [])
    for recording in recordings or []:
        if not recording.features:
            continue

        for name in recording.features:
            names.add(name)

    clips = getattr(obj, "clips", [])
    for clip in clips or []:
        if not clip.features:
            continue

        for name in clip.features:
            names.add(name)

    sound_events = getattr(obj, "sound_events", [])
    for sound_event in sound_events or []:
        if not sound_event.features:
            continue

        for name in sound_event.features:
            names.add(name)

    return await import_feature_names(session, list(names))


async def import_feature_names(
    session: AsyncSession,
    names: list[str],
) -> dict[str, int]:
    """Import a set of recordings in AOEF format into the database."""
    if not names:
        return {}

    # get existing feature names
    stmt = select(models.FeatureName.id, models.FeatureName.name).where(
        models.FeatureName.name.in_(names)
    )
    result = await session.execute(stmt)
    mapping = {r[1]: r[0] for r in result.all()}

    # create missing feature names
    missing = [name for name in names if name not in mapping]
    if not missing:
        return mapping

    values = [
        {"name": name, "created_on": datetime.datetime.now()}
        for name in missing
    ]
    stmt = insert(models.FeatureName).values(values)
    await session.execute(stmt)

    # get new feature names
    stmt = select(models.FeatureName.id, models.FeatureName.name).where(
        models.FeatureName.name.in_(missing)
    )
    result = await session.execute(stmt)
    mapping.update({r[1]: r[0] for r in result.all()})

    return mapping
