import json
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.io.aoef import import_evaluation_set

NIPS_AUDIO_DIR = Path("~/Datasets/Birds/NIPS4B/audio/").expanduser()


async def test_can_import_evaluation_sets(
    session: AsyncSession,
    data_dir: Path,
):
    path = data_dir / "nips4b_evaluation_set.json"
    assert path.exists()
    data = json.loads(path.read_text())
    evaluation_set = await import_evaluation_set(
        session,
        data,
        NIPS_AUDIO_DIR,
        Path.home(),
    )
    assert isinstance(evaluation_set, models.EvaluationSet)
    await session.refresh(evaluation_set)
    anns = await (evaluation_set.awaitable_attrs.clip_annotations)
    assert len(anns) == 674
