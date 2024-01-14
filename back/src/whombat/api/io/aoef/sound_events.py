import datetime
from uuid import UUID

from soundevent.geometry import compute_geometric_features
from soundevent.io.aoef import (
    AnnotationSetObject,
    EvaluationObject,
    PredictionSetObject,
)
from soundevent.io.aoef.sound_event import SoundEventObject
from sqlalchemy import insert, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api import common
from whombat.api.io.aoef.common import get_mapping


async def get_sound_events(
    session: AsyncSession,
    obj: AnnotationSetObject | EvaluationObject | PredictionSetObject,
    recordings: dict[UUID, int],
    feature_names: dict[str, int],
) -> dict[UUID, int]:
    sound_events = getattr(obj, "sound_events", [])
    if sound_events:
        return await import_sound_events(
            session,
            sound_events,
            recordings=recordings,
            feature_names=feature_names,
        )

    sound_event_uuids = set()

    if isinstance(obj, (AnnotationSetObject, EvaluationObject)):
        for annotation in obj.sound_event_annotations or []:
            sound_event_uuids.add(annotation.sound_event)

    if isinstance(obj, (EvaluationObject, PredictionSetObject)):
        for prediction in obj.sound_event_predictions or []:
            sound_event_uuids.add(prediction.sound_event)

    if not sound_event_uuids:
        return {}

    return await get_mapping(session, sound_event_uuids, models.SoundEvent)


async def import_sound_events(
    session: AsyncSession,
    sound_events: list[SoundEventObject],
    recordings: dict[UUID, int],
    feature_names: dict[str, int],
) -> dict[UUID, int]:
    if not sound_events:
        return {}

    values = [
        {
            "uuid": sound_events.uuid,
            "recording_id": recordings[sound_events.recording],
            "geometry_type": sound_events.geometry.type,
            "geometry": sound_events.geometry,
        }
        for sound_events in sound_events
        # Do not import sound events without geometry
        if sound_events.geometry is not None
        # Only import sound events that have a corresponding recording
        if sound_events.recording in recordings
    ]

    await common.create_objects_without_duplicates(
        session=session,
        model=models.SoundEvent,
        data=values,
        key=lambda x: x["uuid"],
        key_column=models.SoundEvent.uuid,
    )

    # Get existing sound events by UUID
    stmt = select(models.SoundEvent.id, models.SoundEvent.uuid).where(
        models.SoundEvent.uuid.in_({s.uuid for s in sound_events})
    )
    result = await session.execute(stmt)
    mapping = {r[1]: r[0] for r in result.all()}

    # Create sound event features
    await _create_sound_event_features(
        session,
        sound_events=sound_events,
        mapping=mapping,
        feature_names=feature_names,
    )

    return mapping


async def _create_sound_event_features(
    session: AsyncSession,
    sound_events: list[SoundEventObject],
    mapping: dict[UUID, int],
    feature_names: dict[str, int],
) -> None:
    values = []
    for sound_event in sound_events:
        if sound_event.geometry is None:
            continue

        sound_event_db_id = mapping.get(sound_event.uuid)
        if sound_event_db_id is None:
            continue

        # Recompute the geometric features to ensure they are up-to-date.
        geometric_features = compute_geometric_features(sound_event.geometry)

        features = {}
        if sound_event.features:
            features.update(sound_event.features)

        for feature in geometric_features:
            features[feature.name] = feature.value

        for name, value in features.items():
            feature_name_db_id = feature_names.get(name)

            if feature_name_db_id is None:
                continue

            values.append(
                {
                    "sound_event_id": sound_event_db_id,
                    "feature_name_id": feature_name_db_id,
                    "value": value,
                    "created_on": datetime.datetime.now(),
                }
            )

    stmt = select(
        models.SoundEventFeature.sound_event_id,
        models.SoundEventFeature.feature_name_id,
    ).where(
        tuple_(
            models.SoundEventFeature.sound_event_id,
            models.SoundEventFeature.feature_name_id,
        ).in_([(v["sound_event_id"], v["feature_name_id"]) for v in values])
    )
    result = await session.execute(stmt)

    existing = set(result.all())
    missing = [
        v
        for v in values
        if (v["sound_event_id"], v["feature_name_id"]) not in existing
    ]
    if not missing:
        return

    stmt = insert(models.SoundEventFeature).values(missing)
    await session.execute(stmt)
