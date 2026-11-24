import json
import shutil
from pathlib import Path
from uuid import uuid4

import pytest
from soundevent import data, io
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models
from whombat.api.io.aoef.datasets import import_dataset


async def test_can_import_a_dataset_with_user_without_email(
    audio_dir: Path,
    random_wav_factory,
    session: AsyncSession,
):
    path = random_wav_factory()

    recording = data.Recording.from_file(
        path,
        owners=[
            data.User(
                name="Test user",
                username=None,
                email=None,
                institution=None,
            )
        ],
    )

    dataset = data.Dataset(
        name="Test dataset",
        description="Test description",
        recordings=[recording],
    )

    aoef_file = "test_dataset.aoef"
    io.save(dataset, audio_dir / aoef_file, audio_dir=audio_dir)

    imported = await import_dataset(
        session,
        audio_dir / aoef_file,
        dataset_dir=audio_dir,
        audio_dir=audio_dir,
    )

    assert imported.name == dataset.name


async def test_can_import_example_dataset(
    session: AsyncSession,
    example_dataset_path: Path,
    example_audio_dir: Path,
):
    imported = await import_dataset(
        session,
        example_dataset_path,
        dataset_dir=example_audio_dir,
        audio_dir=example_audio_dir,
    )
    assert imported.name == "Example Dataset"


async def test_can_import_dataset_with_missing_hashes(
    session: AsyncSession,
    random_wav_factory,
    audio_dir: Path,
):
    path = random_wav_factory()

    recording = data.Recording.from_file(
        path,
        owners=[
            data.User(
                name="Test user",
                username=None,
                email=None,
                institution=None,
            )
        ],
    )

    # Remove the hash
    recording.hash = None

    dataset = data.Dataset(
        name="Test dataset",
        description="Test description",
        recordings=[recording],
    )

    aoef_file = "test_dataset.aoef"
    io.save(dataset, audio_dir / aoef_file, audio_dir=audio_dir)

    imported = await import_dataset(
        session,
        audio_dir / aoef_file,
        dataset_dir=audio_dir,
        audio_dir=audio_dir,
    )

    assert imported.name == dataset.name


async def test_import_reuses_existing_recording_by_hash(
    session: AsyncSession,
    audio_dir: Path,
    random_wav_factory,
):
    first_dir = audio_dir / "first"
    second_dir = audio_dir / "second"
    first_dir.mkdir()
    second_dir.mkdir()
    first_file = random_wav_factory(first_dir / "recording.wav")
    second_file = second_dir / "recording.wav"
    shutil.copyfile(first_file, second_file)

    first = data.Dataset(
        name="First", recordings=[data.Recording.from_file(first_file)]
    )
    second = data.Dataset(
        name="Second", recordings=[data.Recording.from_file(second_file)]
    )
    second.recordings[0].uuid = uuid4()
    assert first.recordings[0].uuid != second.recordings[0].uuid
    first_aoef = audio_dir / "first.json"
    second_aoef = audio_dir / "second.json"
    io.save(first, first_aoef, audio_dir=first_dir)
    io.save(second, second_aoef, audio_dir=second_dir)

    await import_dataset(
        session, first_aoef, dataset_dir=first_dir, audio_dir=audio_dir
    )
    imported = await import_dataset(
        session, second_aoef, dataset_dir=second_dir, audio_dir=audio_dir
    )
    await session.flush()

    links = (
        (
            await session.execute(
                select(models.DatasetRecording).where(
                    models.DatasetRecording.dataset_id == imported.id
                )
            )
        )
        .unique()
        .scalars()
        .all()
    )
    assert len(links) == 1
    assert links[0].path == Path("recording.wav")
    assert (
        await session.scalar(
            select(func.count()).select_from(models.Recording)
        )
        == 1
    )

    by_path_recording = data.Recording.from_file(second_file)
    by_path_recording.uuid = uuid4()
    by_path_recording.hash = "0" * 32
    by_path = data.Dataset(name="By path", recordings=[by_path_recording])
    by_path_aoef = audio_dir / "by_path.json"
    io.save(by_path, by_path_aoef, audio_dir=second_dir)
    imported_by_path = await import_dataset(
        session, by_path_aoef, dataset_dir=second_dir, audio_dir=audio_dir
    )
    assert (
        await session.scalar(
            select(func.count())
            .select_from(models.DatasetRecording)
            .where(models.DatasetRecording.dataset_id == imported_by_path.id)
        )
        == 1
    )

    await import_dataset(
        session, second_aoef, dataset_dir=second_dir, audio_dir=audio_dir
    )
    assert (
        await session.scalar(
            select(func.count())
            .select_from(models.DatasetRecording)
            .where(models.DatasetRecording.dataset_id == imported.id)
        )
        == 1
    )


async def test_reimport_corrects_empty_dataset_directory(
    session: AsyncSession,
    audio_dir: Path,
    random_wav_factory,
):
    recordings_dir = audio_dir / "recordings"
    recordings_dir.mkdir()
    path = random_wav_factory(recordings_dir / "recording.wav")
    dataset = data.Dataset(
        name="Recovered", recordings=[data.Recording.from_file(path)]
    )
    aoef_file = audio_dir / "dataset.json"
    io.save(dataset, aoef_file, audio_dir=recordings_dir)
    empty = models.Dataset(
        name=dataset.name,
        description="",
        audio_dir=Path("."),
        uuid=dataset.uuid,
    )
    session.add(empty)
    await session.flush()

    imported = await import_dataset(
        session,
        aoef_file,
        dataset_dir=recordings_dir,
        audio_dir=audio_dir,
    )
    await session.flush()
    assert imported.id == empty.id
    assert imported.audio_dir == Path("recordings")
    assert (
        await session.scalar(
            select(func.count())
            .select_from(models.DatasetRecording)
            .where(models.DatasetRecording.dataset_id == imported.id)
        )
        == 1
    )

    shutil.copyfile(path, audio_dir / "recording.wav")
    with pytest.raises(exceptions.DataFormatError, match="different audio"):
        await import_dataset(
            session, aoef_file, dataset_dir=audio_dir, audio_dir=audio_dir
        )


async def test_import_rejects_wrong_audio_folder(
    session: AsyncSession,
    audio_dir: Path,
    random_wav_factory,
):
    recordings_dir = audio_dir / "recordings"
    recordings_dir.mkdir()
    path = random_wav_factory(recordings_dir / "recording.wav")
    dataset = data.Dataset(
        name="Wrong folder", recordings=[data.Recording.from_file(path)]
    )
    aoef_file = audio_dir / "dataset.json"
    io.save(dataset, aoef_file, audio_dir=recordings_dir)

    with pytest.raises(exceptions.DataFormatError, match="No recordings"):
        await import_dataset(
            session, aoef_file, dataset_dir=audio_dir, audio_dir=audio_dir
        )
    await session.rollback()
    assert (
        await session.scalar(select(func.count()).select_from(models.Dataset))
        == 0
    )


async def test_import_rejects_recording_path_outside_selected_folder(
    session: AsyncSession,
    audio_dir: Path,
    random_wav_factory,
):
    recordings_dir = audio_dir / "recordings"
    recordings_dir.mkdir()
    path = random_wav_factory(audio_dir / "outside.wav")
    dataset = data.Dataset(
        name="Escaping path", recordings=[data.Recording.from_file(path)]
    )
    aoef_file = audio_dir / "dataset.json"
    io.save(dataset, aoef_file, audio_dir=audio_dir)
    payload = json.loads(aoef_file.read_text())
    payload["data"]["recordings"][0]["path"] = "../outside.wav"
    aoef_file.write_text(json.dumps(payload))

    with pytest.raises(exceptions.DataFormatError, match="outside"):
        await import_dataset(
            session,
            aoef_file,
            dataset_dir=recordings_dir,
            audio_dir=audio_dir,
        )
