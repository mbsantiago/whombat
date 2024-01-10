import json
from pathlib import Path
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.io.aoef import import_dataset

NIPS_AUDIO_DIR = Path("~/Datasets/Birds/NIPS4B/audio/").expanduser()


async def test_can_import_nips_dataset(session: AsyncSession, data_dir: Path):
    dataset_path = data_dir / "nips4b_dataset.json"
    assert dataset_path.exists()
    data = json.loads(dataset_path.read_text())
    dataset = await import_dataset(
        session,
        data,
        NIPS_AUDIO_DIR,
        audio_dir=Path.home(),
    )
    assert isinstance(dataset, models.Dataset)
    assert dataset.uuid == UUID(data["data"]["uuid"])
    assert dataset.name == data["data"]["name"]

    await session.refresh(dataset)
    assert (await dataset.awaitable_attrs.recording_count) == 674
