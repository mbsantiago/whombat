from pathlib import Path

from soundevent import data, io
from sqlalchemy.ext.asyncio import AsyncSession

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
