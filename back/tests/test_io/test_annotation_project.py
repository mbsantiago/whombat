import json
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.io.aoef import import_annotation_project

NIPS_AUDIO_DIR = Path("~/Datasets/Birds/NIPS4B/audio/").expanduser()


async def test_can_import_nips_annotation_project(
    session: AsyncSession, data_dir: Path
):
    project_path = data_dir / "nips4b_annotation_project.json"
    assert project_path.exists()
    data = json.loads(project_path.read_text())
    annotation_project = await import_annotation_project(
        session,
        data,
        NIPS_AUDIO_DIR,
        Path.home(),
    )
    assert isinstance(annotation_project, models.AnnotationProject)
    await session.refresh(annotation_project)
    assert len(await annotation_project.awaitable_attrs.annotation_tasks) == 674
