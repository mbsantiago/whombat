"""Test Suite for the Annotation API."""

from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_created_annotation_is_stored_in_the_database(
    session: AsyncSession,
    user: schemas.User,
    task: schemas.Task,
    sound_event: schemas.SoundEvent,
) -> None:
    """Test that an annotation is stored in the database."""
    annotation = await api.annotations.create(
        session,
        data=schemas.AnnotationPostCreate(
            created_by_id=user.id,
            task_id=task.id,
            sound_event_id=sound_event.id,
        ),
    )

    assert annotation.id is not None

    stmt = select(models.Annotation).where(
        models.Annotation.id == annotation.id
    )
    result = await session.execute(stmt)
    annotation = result.unique().scalars().one_or_none()
    assert annotation is not None
    assert annotation.created_by_id == user.id
    assert annotation.task_id == task.id
    assert annotation.sound_event_id == sound_event.id


async def test_created_annotation_is_returned(
    session: AsyncSession,
    user: schemas.User,
    task: schemas.Task,
    sound_event: schemas.SoundEvent,
) -> None:
    """Test that an annotation is returned."""
    annotation = await api.annotations.create(
        session,
        data=schemas.AnnotationPostCreate(
            created_by_id=user.id,
            task_id=task.id,
            sound_event_id=sound_event.id,
        ),
    )

    isinstance(annotation, schemas.Annotation)
    assert annotation.id is not None
    assert annotation.created_by_id == user.id
    assert annotation.task_id == task.id
    assert annotation.sound_event_id == sound_event.id


async def test_create_annotation_fails_if_task_does_not_exist(
    session: AsyncSession,
    user: schemas.User,
    sound_event: schemas.SoundEvent,
) -> None:
    """Test that creating an annotation fails if the task does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await api.annotations.create(
            session,
            data=schemas.AnnotationPostCreate(
                created_by_id=user.id,
                task_id=999,
                sound_event_id=sound_event.id,
            ),
        )


async def test_create_annotation_fails_if_sound_event_does_not_exist(
    session: AsyncSession,
    user: schemas.User,
    task: schemas.Task,
) -> None:
    """Test that creating an annotation fails if sound event does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await api.annotations.create(
            session,
            data=schemas.AnnotationPostCreate(
                created_by_id=user.id,
                task_id=task.id,
                sound_event_id=999,
            ),
        )


async def test_create_annotation_fails_if_user_does_not_exist(
    session: AsyncSession,
    task: schemas.Task,
    sound_event: schemas.SoundEvent,
) -> None:
    """Test that creating an annotation fails if the user does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await api.annotations.create(
            session,
            data=schemas.AnnotationPostCreate(
                created_by_id=uuid4(),
                task_id=task.id,
                sound_event_id=sound_event.id,
            ),
        )


async def test_can_get_annotation_by_id(
    session: AsyncSession,
    annotation: schemas.Annotation,
) -> None:
    """Test that an annotation can be retrieved by ID."""
    retrieved_annotation = await api.annotations.get_by_id(
        session,
        annotation_id=annotation.id,
    )
    assert retrieved_annotation == annotation


async def test_get_annotation_by_id_fails_if_annotation_does_not_exist(
    session: AsyncSession,
) -> None:
    """Test that getting by ID fails if the annotation does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await api.annotations.get_by_id(
            session,
            annotation_id=999,
        )


async def test_can_get_annotation_by_uuid(
    session: AsyncSession,
    annotation: schemas.Annotation,
) -> None:
    """Test that an annotation can be retrieved by UUID."""
    retrieved_annotation = await api.annotations.get_by_uuid(
        session,
        annotation_uuid=annotation.uuid,
    )
    assert retrieved_annotation == annotation


async def test_get_annotation_by_uuid_fails_if_annotation_does_not_exist(
    session: AsyncSession,
) -> None:
    """Test that getting by UUID fails if the annotation does not exist."""
    with pytest.raises(exceptions.NotFoundError):
        await api.annotations.get_by_uuid(
            session,
            annotation_uuid=uuid4(),
        )


async def test_can_get_annotations(
    session: AsyncSession,
    annotation: schemas.Annotation,
) -> None:
    """Test that all annotations can be retrieved."""
    annotations, _ = await api.annotations.get_many(session)
    assert annotation in annotations
