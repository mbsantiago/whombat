"""Test Suite for the Sound Event Annotation API."""

from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_created_annotation_is_stored_in_the_database(
    session: AsyncSession,
    user: schemas.SimpleUser,
    sound_event: schemas.SoundEvent,
    clip_annotation: schemas.ClipAnnotation,
) -> None:
    """Test that an annotation is stored in the database."""
    annotation = await api.sound_event_annotations.create(
        session,
        created_by=user,
        sound_event=sound_event,
        clip_annotation=clip_annotation,
    )

    assert annotation.id is not None

    stmt = select(models.SoundEventAnnotation).where(
        models.SoundEventAnnotation.id == annotation.id
    )
    result = await session.execute(stmt)
    annotation = result.unique().scalars().one_or_none()
    assert annotation is not None
    assert annotation.created_by_id == user.id
    assert annotation.clip_annotation_id == clip_annotation.id
    assert annotation.sound_event_id == sound_event.id


async def test_created_annotation_is_returned(
    session: AsyncSession,
    user: schemas.SimpleUser,
    clip_annotation: schemas.ClipAnnotation,
    sound_event: schemas.SoundEvent,
) -> None:
    """Test that an annotation is returned."""
    annotation = await api.sound_event_annotations.create(
        session,
        created_by=user,
        sound_event=sound_event,
        clip_annotation=clip_annotation,
    )

    isinstance(annotation, schemas.SoundEventAnnotation)
    assert annotation.id is not None
    assert annotation.created_by == user
    assert annotation.sound_event.model_dump() == sound_event.model_dump()


async def test_can_get_annotation_by_uuid(
    session: AsyncSession,
    sound_event_annotation: schemas.SoundEventAnnotation,
) -> None:
    """Test that an annotation can be retrieved by UUID."""
    retrieved_annotation = await api.sound_event_annotations.get(
        session,
        sound_event_annotation.uuid,
    )
    assert retrieved_annotation == sound_event_annotation


async def test_get_annotation_by_uuid_fails_if_annotation_does_not_exist(
    session: AsyncSession,
) -> None:
    """Test that getting by UUID fails if the annotation does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await api.sound_event_annotations.get(session, uuid4())


async def test_can_get_annotations(
    session: AsyncSession,
    sound_event_annotation: schemas.SoundEventAnnotation,
) -> None:
    """Test that all annotations can be retrieved."""
    annotations, _ = await api.sound_event_annotations.get_many(session)
    assert sound_event_annotation in annotations
