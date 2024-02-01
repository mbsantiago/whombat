from uuid import UUID

from soundevent.io.aoef import (
    AnnotationProjectObject,
    AnnotationSetObject,
    EvaluationObject,
    PredictionSetObject,
)
from soundevent.io.aoef.clip import ClipObject
from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api import common
from whombat.api.io.aoef.common import get_mapping


async def get_clips(
    session: AsyncSession,
    obj: (
        AnnotationSetObject
        | EvaluationObject
        | PredictionSetObject
        | AnnotationProjectObject
    ),
    recordings: dict[UUID, int],
    feature_names: dict[str, int],
    should_import: bool = True,
) -> dict[UUID, int]:
    if obj.clips and should_import:
        return await import_clips(
            session,
            obj.clips,
            recordings,
            feature_names,
        )

    clip_uuids = set()

    if isinstance(obj, (AnnotationSetObject, EvaluationObject)):
        for clip_annotation in obj.clip_annotations or []:
            clip_uuids.add(clip_annotation.clip)

    if isinstance(obj, AnnotationProjectObject):
        for task in obj.tasks or []:
            clip_uuids.add(task.clip)

    if isinstance(obj, (EvaluationObject, PredictionSetObject)):
        for match in obj.clip_predictions or []:
            clip_uuids.add(match.clip)

    if not clip_uuids:
        return {}

    return await get_mapping(session, clip_uuids, models.Clip)


async def import_clips(
    session: AsyncSession,
    clips: list[ClipObject],
    recordings: dict[UUID, int],
    feature_names: dict[str, int],
) -> dict[UUID, int]:
    mapping = await get_mapping(session, {c.uuid for c in clips}, models.Clip)

    missing = [c for c in clips if c.uuid not in mapping]
    if not missing:
        return mapping

    values = []
    for clip in missing:
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

    await _create_clip_features(session, clips, mapping, feature_names)

    return mapping


async def _create_clip_features(
    session: AsyncSession,
    clips: list[ClipObject],
    mapping: dict[UUID, int],
    feature_names: dict[str, int],
) -> None:
    values = []
    for clip in clips:
        if not clip.features:
            continue

        clip_db_id = mapping.get(clip.uuid)
        if clip_db_id is None:
            continue

        for name, value in clip.features.items():
            feature_name_db_id = feature_names.get(name)
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
