"""Test suite for annotation task API."""

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, schemas


async def test_cant_delete_annotation_task_clip(
    session: AsyncSession,
    annotation_task: schemas.AnnotationTask,
):
    clip = await api.annotation_tasks.get_clip(session, annotation_task)

    with pytest.raises(IntegrityError):
        await api.clips.delete(session, clip)
