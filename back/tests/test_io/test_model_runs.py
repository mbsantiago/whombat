import json
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.io.aoef import import_model_run

NIPS_AUDIO_DIR = Path("~/Datasets/Birds/NIPS4B/audio/").expanduser()


async def test_can_import_model_run(
    session: AsyncSession,
    data_dir: Path,
):
    path = data_dir / "nips4b_model_run.json"
    assert path.exists()
    data = json.loads(path.read_text())
    model_run = await import_model_run(
        session,
        data,
        NIPS_AUDIO_DIR,
        Path.home(),
    )
    assert isinstance(model_run, models.ModelRun)
    await session.refresh(model_run)
    anns = await model_run.awaitable_attrs.clip_predictions
    assert len(anns) == 674

    sound_event_predictions = [
        pred
        for clip_prediction in anns
        for pred in clip_prediction.sound_events
    ]
    assert len(sound_event_predictions) == 355
