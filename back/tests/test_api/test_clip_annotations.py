"""Test suite for the Clip Annotations Python API."""

from uuid import uuid4

import pytest
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_created_clip_annotation_is_stored_in_the_database(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test that a created clip_annotation is stored in the database."""
    clip_annotation = await api.clip_annotations.create(
        session,
        clip=clip,
    )
    assert clip_annotation.id is not None

    stmt = select(models.ClipAnnotation).where(
        models.ClipAnnotation.id == clip_annotation.id
    )
    result = await session.execute(stmt)
    db_clip_annotation = result.unique().scalars().one_or_none()
    assert db_clip_annotation is not None
    assert db_clip_annotation.id == clip_annotation.id
    assert db_clip_annotation.clip_id == clip.id
    assert db_clip_annotation.uuid == clip_annotation.uuid
    assert db_clip_annotation.created_on == clip_annotation.created_on


async def test_created_clip_annotation_is_returned(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test that a created clip_annotation is returned."""
    clip_annotation = await api.clip_annotations.create(
        session,
        clip=clip,
    )
    assert isinstance(clip_annotation, schemas.ClipAnnotation)


async def test_can_create_a_clip_annotation_with_a_given_uuid(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test that a clip_annotation can be created with a given UUID."""
    uuid = uuid4()
    clip_annotation = await api.clip_annotations.create(
        session,
        clip=clip,
        uuid=uuid,
    )
    assert clip_annotation.uuid == uuid


async def test_can_get_a_clip_annotation_by_uuid(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test that a clip_annotation can be retrieved by its UUID."""
    clip_annotation = await api.clip_annotations.create(
        session,
        clip=clip,
    )
    retrieved_clip_annotation = await api.clip_annotations.get(
        session,
        clip_annotation.uuid,
    )
    assert retrieved_clip_annotation.id == clip_annotation.id


async def test_cannot_get_a_clip_annotation_with_an_invalid_uuid(
    session: AsyncSession,
):
    """Test that a clip_annotation cannot be retrieved with an invalid UUID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.clip_annotations.get(session, uuid4())


async def test_added_tag_is_stored_in_the_database(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    tag: schemas.Tag,
    user: schemas.SimpleUser,
):
    """Test that an added tag is stored in the database."""
    await api.clip_annotations.add_tag(
        session,
        clip_annotation,
        tag,
        user,
    )

    stmt = select(models.ClipAnnotationTag).where(
        tuple_(
            models.ClipAnnotationTag.clip_annotation_id,
            models.ClipAnnotationTag.tag_id,
        )
        == (clip_annotation.id, tag.id),
    )
    result = await session.execute(stmt)
    db_clip_annotation_tag = result.unique().scalars().one_or_none()
    assert db_clip_annotation_tag is not None
    assert db_clip_annotation_tag.clip_annotation_id == clip_annotation.id
    assert db_clip_annotation_tag.tag_id == tag.id


async def test_cannot_add_duplicate_tag_to_clip_annotation(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    tag: schemas.Tag,
    user: schemas.SimpleUser,
):
    """Test that a duplicate tag cannot be added to a clip_annotation."""
    await api.clip_annotations.add_tag(session, clip_annotation, tag, user)

    with pytest.raises(exceptions.DuplicateObjectError):
        await api.clip_annotations.add_tag(
            session,
            clip_annotation,
            tag,
            user,
        )


async def test_added_note_is_stored_in_the_database(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    note: schemas.Note,
):
    """Test that an added note is stored in the database."""
    await api.clip_annotations.add_note(session, clip_annotation, note)

    stmt = select(models.ClipAnnotationNote).where(
        tuple_(
            models.ClipAnnotationNote.clip_annotation_id,
            models.ClipAnnotationNote.note_id,
        )
        == (clip_annotation.id, note.id),
    )
    result = await session.execute(stmt)
    db_clip_annotation_note = result.unique().scalars().one_or_none()
    assert db_clip_annotation_note is not None
    assert db_clip_annotation_note.clip_annotation_id == clip_annotation.id
    assert db_clip_annotation_note.note_id == note.id


async def test_added_note_is_in_the_notes_list(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    note: schemas.Note,
):
    """Test that an added note is returned."""
    clip_annotation = await api.clip_annotations.add_note(
        session, clip_annotation, note
    )
    assert any(
        clip_annotation_note.id == note.id
        for clip_annotation_note in clip_annotation.notes
    )


async def test_cannot_add_duplicate_note_to_clip_annotation(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    note: schemas.Note,
):
    """Test that a duplicate note cannot be added to a clip_annotation."""
    await api.clip_annotations.add_note(session, clip_annotation, note)
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.clip_annotations.add_note(session, clip_annotation, note)


async def test_can_remove_note_from_clip_annotation(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    note: schemas.Note,
):
    """Test that a note can be removed from a clip_annotation."""
    clip_annotation = await api.clip_annotations.add_note(
        session, clip_annotation, note
    )
    clip_annotation = await api.clip_annotations.remove_note(
        session, clip_annotation, note
    )
    assert len(clip_annotation.notes) == 0


async def test_removed_note_is_deleted_in_the_database(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    note: schemas.Note,
):
    """Test that a removed note is deleted in the database."""
    clip_annotation = await api.clip_annotations.add_note(
        session, clip_annotation, note
    )
    await api.clip_annotations.remove_note(session, clip_annotation, note)

    stmt = select(models.ClipAnnotationNote).where(
        tuple_(
            models.ClipAnnotationNote.clip_annotation_id,
            models.ClipAnnotationNote.note_id,
        )
        == (clip_annotation.id, note.id),
    )
    result = await session.execute(stmt)
    db_clip_annotation_note = result.unique().scalars().one_or_none()
    assert db_clip_annotation_note is None
