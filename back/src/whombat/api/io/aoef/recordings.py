import logging
from pathlib import Path
from uuid import UUID

from soundevent.io.aoef import (
    AnnotationSetObject,
    EvaluationObject,
    PredictionSetObject,
)
from soundevent.io.aoef.recording import RecordingObject
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.common import create_objects_without_duplicates
from whombat.api.io.aoef.common import get_mapping
from whombat.api.io.aoef.notes import import_notes

logger = logging.getLogger(__name__)


async def get_recordings(
    session: AsyncSession,
    obj: AnnotationSetObject | EvaluationObject | PredictionSetObject,
    tags: dict[int, int],
    users: dict[UUID, UUID],
    feature_names: dict[str, int],
    audio_dir: Path,
    base_audio_dir: Path,
    should_import: bool = True,
) -> dict[UUID, int]:
    if obj.recordings and should_import:
        return await import_recordings(
            session,
            obj.recordings,
            tags=tags,
            users=users,
            feature_names=feature_names,
            audio_dir=audio_dir,
            base_audio_dir=base_audio_dir,
        )

    recording_uuids: set[UUID] = set()

    for sound_event in obj.sound_events or []:
        recording_uuids.add(sound_event.recording)

    for clip in obj.clips or []:
        recording_uuids.add(clip.recording)

    if not recording_uuids:
        return {}

    return await get_mapping(session, recording_uuids, models.Recording)


async def import_recordings(
    session: AsyncSession,
    recordings: list[RecordingObject],
    tags: dict[int, int],
    users: dict[UUID, UUID],
    feature_names: dict[str, int],
    audio_dir: Path | None = None,
    base_audio_dir: Path = Path.home(),
) -> dict[UUID, int]:
    """Import a set of recordings in AOEF format into the database.

    Notes
    -----
    This function trusts the caller to have checked the validity of the
    recording data. It will check if the recording file exists, but it will
    not check if it is a valid audio file nor reread its metadata.
    """
    if not recordings:
        return {}

    if not audio_dir:
        # If no audio directory is given, assume that the paths are relative
        # to the base audio directory
        audio_dir = base_audio_dir

    if not audio_dir.is_absolute():
        # If the audio directory is not absolute, assume that it is relative
        # to the base audio directory
        audio_dir = base_audio_dir / audio_dir

    if not audio_dir.is_relative_to(base_audio_dir):
        raise ValueError(
            f"Audio directory {audio_dir} is not in the base audio directory"
        )

    # Filter out invalid recordings
    recordings = [
        rec
        for rec in recordings
        if check_recording(
            rec, audio_dir=audio_dir, base_audio_dir=base_audio_dir
        )
    ]

    mapping: dict[UUID, int] = {}

    # Get existing recordings by UUID
    recs_by_uuid = await _get_existing_recordings_by_uuid(session, recordings)
    mapping.update(recs_by_uuid)

    # Get existing recordings by hash
    recs_by_hash = await _get_existing_recordings_by_hash(
        session, [rec for rec in recordings if rec.uuid not in mapping]
    )
    mapping.update(recs_by_hash)

    # Get existing recordings by path
    recs_by_path = await _get_existing_recordings_by_path(
        session,
        [rec for rec in recordings if rec.uuid not in mapping],
        audio_dir=audio_dir,
        base_audio_dir=base_audio_dir,
    )
    mapping.update(recs_by_path)

    # Create all missing recordings
    missing_recordings = [
        rec
        for rec in recordings
        if rec.uuid not in mapping and rec.hash not in mapping
    ]
    new_recordings = await _create_recordings(
        session,
        missing_recordings,
        audio_dir,
        base_audio_dir,
    )
    mapping.update(new_recordings)

    # Create recording tags
    await _create_recording_tags(session, recordings, mapping, tags)

    # Create recording notes
    await _create_recording_notes(session, recordings, mapping, users)

    # Create recording features
    await _create_recording_features(
        session,
        recordings,
        mapping,
        feature_names,
    )

    return mapping


async def _get_existing_recordings_by_uuid(
    session: AsyncSession,
    recordings: list[RecordingObject],
) -> dict[UUID, int]:
    uuids = {rec.uuid for rec in recordings}
    if not uuids:
        return {}
    existing_recordings = await session.execute(
        select(models.Recording).filter(models.Recording.uuid.in_(uuids))
    )
    return {
        rec.uuid: rec.id
        for rec in existing_recordings.unique().scalars().all()
    }


async def _get_existing_recordings_by_hash(
    session: AsyncSession,
    recordings: list[RecordingObject],
) -> dict[UUID, int]:
    hashes = {rec.hash for rec in recordings}
    if not hashes:
        return {}
    existing_recordings = await session.execute(
        select(models.Recording).filter(models.Recording.hash.in_(hashes))
    )
    return {
        rec.uuid: rec.id
        for rec in existing_recordings.unique().scalars().all()
    }


async def _get_existing_recordings_by_path(
    session: AsyncSession,
    recordings: list[RecordingObject],
    audio_dir: Path,
    base_audio_dir: Path,
) -> dict[UUID, int]:
    paths = {
        normalize_audio_path(rec, audio_dir, base_audio_dir)
        for rec in recordings
    }
    if not paths:
        return {}
    existing_recordings = await session.execute(
        select(models.Recording).filter(models.Recording.path.in_(paths))
    )
    return {
        rec.uuid: rec.id
        for rec in existing_recordings.unique().scalars().all()
    }


async def _create_recordings(
    session: AsyncSession,
    recordings: list[RecordingObject],
    audio_dir: Path,
    base_audio_dir: Path,
) -> dict[UUID, int]:
    values = [
        {
            "uuid": rec.uuid,
            "hash": rec.hash,
            "path": normalize_audio_path(rec, audio_dir, base_audio_dir),
            "time_expansion": rec.time_expansion or 1,
            "duration": rec.duration,
            "samplerate": rec.samplerate,
            "channels": rec.channels,
            "latitude": rec.latitude,
            "longitude": rec.longitude,
            "date": rec.date,
            "time": rec.time,
            "rights": rec.rights,
        }
        for rec in recordings
    ]
    recs = await create_objects_without_duplicates(
        session,
        models.Recording,
        values,
        key=lambda x: x["uuid"],
        key_column=models.Recording.uuid,
    )
    return {rec.uuid: rec.id for rec in recs}


async def _create_recording_tags(
    session: AsyncSession,
    recordings: list[RecordingObject],
    mapping: dict[UUID, int],
    tags: dict[int, int],
) -> None:
    values = []
    for recording in recordings:
        if not recording.tags:
            # If recording has no tags, skip it
            continue

        rec_db_id = mapping.get(recording.uuid)

        if rec_db_id is None:
            # If recording could not be created, skip it
            continue

        for tag_id in recording.tags:
            tag_db_id = tags.get(tag_id)

            if tag_db_id is None:
                # If tag could not be found, skip it
                continue

            values.append({"recording_id": rec_db_id, "tag_id": tag_db_id})

    await create_objects_without_duplicates(
        session,
        models.RecordingTag,
        values,
        key=lambda x: (x["recording_id"], x["tag_id"]),
        key_column=tuple_(
            models.RecordingTag.recording_id, models.RecordingTag.tag_id
        ),
    )


async def _create_recording_notes(
    session: AsyncSession,
    recordings: list[RecordingObject],
    mapping: dict[UUID, int],
    users: dict[UUID, UUID],
) -> None:
    notes = [
        note for recording in recordings for note in recording.notes or []
    ]

    note_mapping = await import_notes(session, notes, users)

    values = []
    for recording in recordings:
        if not recording.notes:
            # If recording has no notes, skip it
            continue

        rec_db_id = mapping.get(recording.uuid)

        if rec_db_id is None:
            # If recording could not be created, skip it
            continue

        for note in recording.notes:
            note_db_id = note_mapping.get(note.uuid)

            if note_db_id is None:
                # If note could not be found, skip it
                continue

            values.append({"recording_id": rec_db_id, "note_id": note_db_id})

    await create_objects_without_duplicates(
        session,
        models.RecordingNote,
        values,
        key=lambda x: (x["recording_id"], x["note_id"]),
        key_column=tuple_(
            models.RecordingNote.recording_id,
            models.RecordingNote.note_id,
        ),
    )


async def _create_recording_features(
    session: AsyncSession,
    recordings: list[RecordingObject],
    mapping: dict[UUID, int],
    feature_names: dict[str, int],
) -> None:
    values = []
    for recording in recordings:
        if not recording.features:
            # If recording has no features, skip it
            continue

        rec_db_id = mapping.get(recording.uuid)

        if rec_db_id is None:
            # If recording could not be created, skip it
            continue

        for name, value in recording.features.items():
            feature_name_db_id = feature_names.get(name)
            if feature_name_db_id is None:
                # If feature name could not be found, skip it
                continue

            values.append(
                {
                    "recording_id": rec_db_id,
                    "feature_name_id": feature_name_db_id,
                    "value": value,
                }
            )

    await create_objects_without_duplicates(
        session,
        models.RecordingFeature,
        values,
        key=lambda x: (x["recording_id"], x["feature_name_id"]),
        key_column=tuple_(
            models.RecordingFeature.recording_id,
            models.RecordingFeature.feature_name_id,
        ),
    )


def check_recording(
    recording: RecordingObject,
    audio_dir: Path,
    base_audio_dir: Path,
) -> bool:
    """Check if a recording is valid."""
    path = recording.path

    if not path.is_absolute():
        path = audio_dir / path

    if not path.is_file():
        logger.warning(f"Recording file {path} not found")
        return False

    if not path.is_relative_to(base_audio_dir):
        logger.warning(
            f"Recording file {path} is not in the base audio directory"
        )
        return False

    return True


def normalize_audio_path(
    recording: RecordingObject,
    audio_dir: Path,
    base_audio_dir: Path,
) -> Path:
    """Normalize the audio path of a recording."""
    path = recording.path

    if not path.is_absolute():
        # If the path is not absolute, assume that it is relative to the audio
        # directory
        path = audio_dir / path

    # Return the path relative to the base audio directory
    return path.relative_to(base_audio_dir)
