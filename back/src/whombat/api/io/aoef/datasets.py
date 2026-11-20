from pathlib import Path
from typing import BinaryIO

from sqlalchemy import tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models
from whombat.api import common
from whombat.api.io.aoef.common import parse_aoef_object
from whombat.api.io.aoef.features import get_feature_names
from whombat.api.io.aoef.recordings import import_recordings
from whombat.api.io.aoef.tags import import_tags
from whombat.api.io.aoef.users import import_users
from whombat.core.files import resolve_within_root


async def import_dataset(
    session: AsyncSession,
    src: Path | BinaryIO | str,
    dataset_dir: Path,
    audio_dir: Path,
) -> models.Dataset:
    obj = parse_aoef_object(src)

    if obj.data.collection_type != "dataset":
        raise exceptions.DataFormatError(
            message=(
                "Invalid Dataset file. "
                "The provided file is a valid AOEF object, but it is not an "
                "Dataset. Detected object type: "
                f"'{obj.data.collection_type}'. "
                "Please ensure you provided the correct file or convert it "
                "to a Dataset."
            ),
            format="aoef-dataset",
        )

    dataset_object = obj.data

    if not dataset_dir.is_absolute():
        # Assume relative to audio_dir
        dataset_dir = audio_dir / dataset_dir

    audio_dir = audio_dir.resolve()
    dataset_dir = resolve_within_root(dataset_dir, audio_dir)

    tags = await import_tags(session, dataset_object.tags or [])

    users = await import_users(session, dataset_object.users or [])

    feature_names = await get_feature_names(
        session,
        dataset_object,
    )

    recordings = await import_recordings(
        session,
        dataset_object.recordings or [],
        tags=tags,
        users=users,
        feature_names=feature_names,
        audio_dir=dataset_dir,
        base_audio_dir=audio_dir,
    )

    try:
        dataset = await common.get_object(
            session,
            models.Dataset,
            models.Dataset.uuid == dataset_object.uuid,
        )
    except exceptions.NotFoundError:
        dataset = await common.create_object(
            session,
            models.Dataset,
            name=dataset_object.name,
            description=dataset_object.description,
            audio_dir=dataset_dir.relative_to(audio_dir),
            uuid=dataset_object.uuid,
        )

    path_mapping = {
        recording.uuid: normalize_path(recording.path, dataset_dir)
        for recording in dataset_object.recordings or []
    }

    # Create dataset recordings
    values = [
        {
            "recording_id": recording_id,
            "dataset_id": dataset.id,
            "path": path_mapping[recording_uuid],
        }
        for recording_uuid, recording_id in recordings.items()
    ]
    await common.create_objects_without_duplicates(
        session,
        models.DatasetRecording,
        values,
        key=lambda x: (x["recording_id"], x["dataset_id"]),
        key_column=tuple_(
            models.DatasetRecording.recording_id,
            models.DatasetRecording.dataset_id,
        ),
    )

    return dataset


def normalize_path(path: Path, dataset_dir: Path) -> Path:
    """Normalize a path to a dataset directory."""
    if path.is_absolute():
        return path.relative_to(dataset_dir)
    return path
