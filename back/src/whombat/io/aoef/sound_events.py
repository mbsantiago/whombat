import uuid

from soundevent.geometry import compute_geometric_features
from soundevent.io.aoef.sound_event import SoundEventObject
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api import common
from whombat.io.aoef.features import import_feature_names


async def import_sound_events(
    session: AsyncSession,
    sound_events: list[SoundEventObject],
    recording_uuids: list[uuid.UUID],
    recordings: dict[uuid.UUID, models.Recording] | None = None,
) -> dict[uuid.UUID, int]:
    if not sound_events:
        return {}

    if recordings is None:
        recordings = {}

    if not len(sound_events) == len(recording_uuids):
        raise ValueError(
            "The number of sound events and recording UUIDs must be equal."
        )

    values = [
        {
            "uuid": s.uuid,
            "recording_id": recordings[rec_uuid],
            "geometry_type": s.geometry.type,
            "geometry": s.geometry,
        }
        for s, rec_uuid in zip(sound_events, recording_uuids)
        # Do not import sound events without geometry
        if s.geometry is not None
        # Only import sound events that have a corresponding recording
        if rec_uuid in recordings
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
    )

    return mapping


async def _create_sound_event_features(
    session: AsyncSession,
    sound_events: list[SoundEventObject],
    mapping: dict[uuid.UUID, int],
) -> None:
    feature_names = set()
    for sound_event in sound_events:
        if not sound_event.features:
            continue

        for name in sound_event.features.keys():
            feature_names.add(name)

    # Get feature names
    feature_names = await import_feature_names(
        session,
        list(feature_names),
    )

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

        for name, value in features.values():
            feature_name_db_id = feature_names.get(name)

            if feature_name_db_id is None:
                continue

            values.append(
                {
                    "sound_event_id": sound_event_db_id,
                    "feature_name_id": feature_name_db_id,
                    "value": value,
                }
            )

    await common.create_objects_without_duplicates(
        session=session,
        model=models.SoundEventFeature,
        data=values,
        key=lambda x: tuple_(x["sound_event_id"], x["feature_name_id"]),
        key_column=models.SoundEventFeature.sound_event_id,
    )
