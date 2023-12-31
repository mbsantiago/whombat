import uuid

from soundevent.io.aoef.clip import ClipObject
from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api import common
from whombat.io.aoef.features import import_feature_names


async def import_clips(
    session: AsyncSession,
    clips: list[ClipObject],
    recordings: dict[uuid.UUID, int],
) -> dict[uuid.UUID, int]:
    # Get existing clips by UUID
    uuids = {clip.uuid for clip in clips}
    db_clips, _ = await common.get_objects(
        session,
        models.Clip,
        limit=None,
        filters=[models.Clip.uuid.in_(uuids)],
    )
    mapping = {clip.uuid: clip.id for clip in db_clips}

    values = []
    for clip in clips:
        if clip.uuid in mapping:
            continue

        recording_db_id = recordings.get(clip.recording)

        if recording_db_id is None:
            continue

        values.append(
            {
                "uuid": clip.uuid,
                "recording_id": recording_db_id,
                "start_time": clip.start_time,
                "end_time": clip.end_time,
            }
        )

    # TODO: What if a clip already exists with the same start/end time and
    # recording but different UUID? This is possible if the same clip is
    # imported twice with different UUIDs. While this is unlikely, it is
    # possible, and it would be nice to handle it gracefully.

    db_clips = await common.create_objects_without_duplicates(
        session,
        models.Clip,
        values,
        key=lambda x: (x["recording_id"], x["start_time"], x["end_time"]),
        key_column=tuple_(
            models.Clip.recording_id,
            models.Clip.start_time,
            models.Clip.end_time,
        ),
    )
    mapping.update({clip.uuid: clip.id for clip in db_clips})

    await _create_clip_features(session, clips, mapping)

    return mapping


async def _create_clip_features(
    session: AsyncSession,
    clips: list[ClipObject],
    mapping: dict[uuid.UUID, int],
) -> None:
    feature_names = set()
    for clip in clips:
        if not clip.features:
            continue
        feature_names.update(clip.features.keys())

    db_feature_names = await import_feature_names(session, list(feature_names))

    values = []
    for clip in clips:
        if not clip.features:
            continue

        clip_db_id = mapping.get(clip.uuid)
        if clip_db_id is None:
            continue

        for name, value in clip.features.items():
            feature_name_db_id = db_feature_names.get(name)
            if feature_name_db_id is None:
                # If feature name could not be found, skip it
                continue

            values.append(
                {
                    "clip_id": clip_db_id,
                    "feature_name_id": feature_name_db_id,
                    "value": value,
                }
            )

    await common.create_objects_without_duplicates(
        session,
        models.ClipFeature,
        values,
        key=lambda x: (x["clip_id"], x["feature_name_id"]),
        key_column=tuple_(
            models.ClipFeature.clip_id, models.ClipFeature.feature_name_id
        ),
    )
