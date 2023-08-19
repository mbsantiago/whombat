"""Test suite for tasks Python API."""

from uuid import uuid4

import pytest
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_created_task_is_stored_in_the_database(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
):
    """Test that a created task is stored in the database."""
    task = await api.tasks.create_task(
        session,
        schemas.TaskCreate(
            project_id=annotation_project.id,
            clip_id=clip.id,
        ),
    )
    assert task.id is not None

    stmt = select(models.Task).where(models.Task.id == task.id)
    result = await session.execute(stmt)
    db_task = result.unique().scalars().one_or_none()
    assert db_task is not None
    assert db_task.id == task.id
    assert db_task.project_id == annotation_project.id
    assert db_task.clip_id == clip.id
    assert db_task.uuid == task.uuid
    assert db_task.created_at == task.created_at


async def test_created_task_is_returned(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
):
    """Test that a created task is returned."""
    task = await api.tasks.create_task(
        session,
        schemas.TaskCreate(
            project_id=annotation_project.id,
            clip_id=clip.id,
        ),
    )
    assert isinstance(task, schemas.Task)


async def test_cannot_create_duplicate_task(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
):
    """Test that a duplicate task cannot be created."""
    await api.tasks.create_task(
        session,
        schemas.TaskCreate(
            project_id=annotation_project.id,
            clip_id=clip.id,
        ),
    )

    with pytest.raises(exceptions.DuplicateObjectError):
        await api.tasks.create_task(
            session,
            schemas.TaskCreate(
                project_id=annotation_project.id,
                clip_id=clip.id,
            ),
        )


async def test_create_fails_with_invalid_project_id(
    session: AsyncSession,
    clip: schemas.Clip,
):
    """Test that a task cannot be created with an invalid project ID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.tasks.create_task(
            session,
            schemas.TaskCreate(
                project_id=999,
                clip_id=clip.id,
            ),
        )


async def test_create_fails_with_invalid_clip_id(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that a task cannot be created with an invalid clip ID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.tasks.create_task(
            session,
            schemas.TaskCreate(
                project_id=annotation_project.id,
                clip_id=999,
            ),
        )


async def test_can_create_a_task_with_a_given_uuid(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
):
    """Test that a task can be created with a given UUID."""
    uuid = uuid4()
    task = await api.tasks.create_task(
        session,
        schemas.TaskCreate(
            project_id=annotation_project.id,
            clip_id=clip.id,
            uuid=uuid,
        ),
    )
    assert task.uuid == uuid


async def test_can_get_a_task_by_uuid(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
):
    """Test that a task can be retrieved by its UUID."""
    task = await api.tasks.create_task(
        session,
        schemas.TaskCreate(
            project_id=annotation_project.id,
            clip_id=clip.id,
        ),
    )
    retrieved_task = await api.tasks.get_task_by_uuid(session, task.uuid)
    assert retrieved_task.id == task.id


async def test_cannot_get_a_task_with_an_invalid_uuid(
    session: AsyncSession,
):
    """Test that a task cannot be retrieved with an invalid UUID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.tasks.get_task_by_uuid(session, uuid4())


async def test_can_get_a_task_by_id(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
):
    """Test that a task can be retrieved by its ID."""
    task = await api.tasks.create_task(
        session,
        schemas.TaskCreate(
            project_id=annotation_project.id,
            clip_id=clip.id,
        ),
    )
    retrieved_task = await api.tasks.get_task_by_id(session, task.id)
    assert retrieved_task.id == task.id


async def test_cannot_get_a_task_with_an_invalid_id(
    session: AsyncSession,
):
    """Test that a task cannot be retrieved with an invalid ID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.tasks.get_task_by_id(session, 999)


async def test_added_tag_is_stored_in_the_database(
    session: AsyncSession,
    task: schemas.Task,
    tag: schemas.Tag,
    user: schemas.User,
):
    """Test that an added tag is stored in the database."""
    await api.tasks.add_tag_to_task(
        session, task_id=task.id, tag_id=tag.id, created_by_id=user.id
    )

    stmt = select(models.TaskTag).where(
        tuple_(
            models.TaskTag.task_id,
            models.TaskTag.tag_id,
        )
        == (task.id, tag.id),
    )
    result = await session.execute(stmt)
    db_task_tag = result.unique().scalars().one_or_none()
    assert db_task_tag is not None
    assert db_task_tag.task_id == task.id
    assert db_task_tag.tag_id == tag.id


async def test_added_tag_is_in_the_tags_list(
    session: AsyncSession,
    task: schemas.Task,
    tag: schemas.Tag,
    user: schemas.User,
):
    """Test that an added tag is returned."""
    task = await api.tasks.add_tag_to_task(session, task.id, tag.id, user.id)
    assert any(task_tag.tag.id == tag.id for task_tag in task.tags)


async def test_cannot_add_duplicate_tag_to_task(
    session: AsyncSession,
    task: schemas.Task,
    tag: schemas.Tag,
    user: schemas.User,
):
    """Test that a duplicate tag cannot be added to a task."""
    await api.tasks.add_tag_to_task(session, task.id, tag.id, user.id)
    task = await api.tasks.add_tag_to_task(session, task.id, tag.id, user.id)
    assert len(task.tags) == 1


async def test_can_remove_tag_from_task(
    session: AsyncSession,
    task: schemas.Task,
    tag: schemas.Tag,
    user: schemas.User,
):
    """Test that a tag can be removed from a task."""
    task = await api.tasks.add_tag_to_task(session, task.id, tag.id, user.id)
    task_tag = next(
        (
            task_tag
            for task_tag in task.tags
            if task_tag.tag_id == tag.id and task_tag.created_by_id == user.id
        ),
        None,
    )
    assert task_tag is not None
    task = await api.tasks.remove_tag_from_task(session, task.id, task_tag.id)
    assert len(task.tags) == 0


async def test_removed_tag_is_deleted_in_the_database(
    session: AsyncSession,
    task: schemas.Task,
    tag: schemas.Tag,
    user: schemas.User,
):
    """Test that a removed tag is deleted in the database."""
    task = await api.tasks.add_tag_to_task(session, task.id, tag.id, user.id)
    task_tag = next(
        (
            task_tag
            for task_tag in task.tags
            if task_tag.tag_id == tag.id and task_tag.created_by_id == user.id
        ),
        None,
    )
    assert task_tag is not None
    await api.tasks.remove_tag_from_task(session, task.id, task_tag.id)

    stmt = select(models.TaskTag).where(
        tuple_(
            models.TaskTag.task_id,
            models.TaskTag.tag_id,
            models.TaskTag.created_by_id,
        )
        == (task.id, tag.id, user.id),
    )
    result = await session.execute(stmt)
    db_task_tag = result.unique().scalars().one_or_none()
    assert db_task_tag is None


async def test_remove_tag_fails_with_invalid_task_id(
    session: AsyncSession,
    task_tag: schemas.TaskTag,
):
    """Test that a tag cannot be removed from a task with an invalid task ID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.tasks.remove_tag_from_task(session, 999, task_tag.id)


async def test_remove_tag_does_not_fail_with_invalid_tag_id(
    session: AsyncSession,
    task: schemas.Task,
):
    """Test that a tag can be removed from a task even if it doesn't exist."""
    await api.tasks.remove_tag_from_task(session, task.id, 999)


async def test_remove_tag_does_not_fail_with_nonexistent_tag(
    session: AsyncSession,
    task: schemas.Task,
):
    """Test that a tag can be removed from a task even if it doesn't exist."""
    await api.tasks.remove_tag_from_task(session, task.id, 999)


async def test_added_status_badge_is_stored_in_the_database(
    session: AsyncSession,
    task: schemas.Task,
    user: schemas.User,
):
    """Test that an added status badge is stored in the database."""
    state = models.TaskState.assigned
    await api.tasks.add_status_badge_to_task(
        session,
        task_id=task.id,
        user_id=user.id,
        state=state,
    )

    stmt = select(models.TaskStatusBadge).where(
        tuple_(
            models.TaskStatusBadge.task_id,
            models.TaskStatusBadge.state,
            models.TaskStatusBadge.user_id,
        )
        == (task.id, state, user.id),
    )
    result = await session.execute(stmt)
    db_task_status_badge = result.unique().scalars().one_or_none()
    assert db_task_status_badge is not None
    assert db_task_status_badge.task_id == task.id


async def test_added_status_badge_is_in_the_status_badges_list(
    session: AsyncSession,
    task: schemas.Task,
    user: schemas.User,
):
    """Test that an added status badge is returned."""
    state = models.TaskState.assigned
    task = await api.tasks.add_status_badge_to_task(
        session,
        task_id=task.id,
        user_id=user.id,
        state=state,
    )
    assert any(
        task_status_badge.state == state
        and task_status_badge.user.id == user.id
        for task_status_badge in task.status_badges
    )


async def test_cannot_add_duplicate_status_badge_to_task(
    session: AsyncSession,
    task: schemas.Task,
    user: schemas.User,
):
    """Test that a duplicate status badge cannot be added to a task."""
    state = models.TaskState.assigned
    await api.tasks.add_status_badge_to_task(
        session,
        task_id=task.id,
        user_id=user.id,
        state=state,
    )
    with pytest.raises(exceptions.DuplicateObjectError):
        task = await api.tasks.add_status_badge_to_task(
            session,
            task_id=task.id,
            user_id=user.id,
            state=state,
        )


async def test_can_remove_status_badge_from_task(
    session: AsyncSession,
    task: schemas.Task,
    user: schemas.User,
):
    """Test that a status badge can be removed from a task."""
    state = models.TaskState.assigned
    task = await api.tasks.add_status_badge_to_task(
        session,
        task_id=task.id,
        user_id=user.id,
        state=state,
    )
    badge = next(badge for badge in task.status_badges if badge.state == state)
    task = await api.tasks.remove_status_badge_from_task(
        session,
        task_id=task.id,
        status_badge_id=badge.id,
    )
    assert len(task.status_badges) == 0


async def test_removed_status_badge_is_deleted_in_the_database(
    session: AsyncSession,
    task: schemas.Task,
    user: schemas.User,
):
    """Test that a removed status badge is deleted in the database."""
    state = models.TaskState.assigned
    task = await api.tasks.add_status_badge_to_task(
        session,
        task_id=task.id,
        user_id=user.id,
        state=state,
    )
    badge = next(badge for badge in task.status_badges if badge.state == state)
    await api.tasks.remove_status_badge_from_task(
        session,
        task_id=task.id,
        status_badge_id=badge.id,
    )

    stmt = select(models.TaskStatusBadge).where(
        tuple_(
            models.TaskStatusBadge.task_id,
            models.TaskStatusBadge.state,
            models.TaskStatusBadge.user_id,
        )
        == (task.id, state, user.id),
    )
    result = await session.execute(stmt)
    db_task_status_badge = result.unique().scalars().one_or_none()
    assert db_task_status_badge is None


async def test_remove_status_badge_fails_with_invalid_task_id(
    session: AsyncSession,
    task_status_badge: schemas.TaskStatusBadge,
):
    """Test that a status badge cannot be removed from an invalid task ID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.tasks.remove_status_badge_from_task(
            session,
            task_id=999,
            status_badge_id=task_status_badge.id,
        )


async def test_remove_status_badge_fails_with_invalid_status_badge_id(
    session: AsyncSession,
    task: schemas.Task,
):
    """Test that a status badge cannot be removed with an invalid ID."""
    with pytest.raises(exceptions.NotFoundError):
        await api.tasks.remove_status_badge_from_task(
            session,
            task_id=task.id,
            status_badge_id=999,
        )


async def test_added_note_is_stored_in_the_database(
    session: AsyncSession,
    task: schemas.Task,
    note: schemas.Note,
):
    """Test that an added note is stored in the database."""
    await api.tasks.add_note_to_task(session, task.id, note.id)

    stmt = select(models.TaskNote).where(
        tuple_(
            models.TaskNote.task_id,
            models.TaskNote.note_id,
        )
        == (task.id, note.id),
    )
    result = await session.execute(stmt)
    db_task_note = result.unique().scalars().one_or_none()
    assert db_task_note is not None
    assert db_task_note.task_id == task.id
    assert db_task_note.note_id == note.id


async def test_added_note_is_in_the_notes_list(
    session: AsyncSession,
    task: schemas.Task,
    note: schemas.Note,
):
    """Test that an added note is returned."""
    task = await api.tasks.add_note_to_task(session, task.id, note.id)
    assert any(task_note.id == note.id for task_note in task.notes)


async def test_cannot_add_duplicate_note_to_task(
    session: AsyncSession,
    task: schemas.Task,
    note: schemas.Note,
):
    """Test that a duplicate note cannot be added to a task."""
    await api.tasks.add_note_to_task(session, task.id, note.id)
    task = await api.tasks.add_note_to_task(session, task.id, note.id)
    assert len(task.notes) == 1


async def test_can_remove_note_from_task(
    session: AsyncSession,
    task: schemas.Task,
    note: schemas.Note,
):
    """Test that a note can be removed from a task."""
    await api.tasks.add_note_to_task(session, task.id, note.id)
    task = await api.tasks.remove_note_from_task(session, task.id, note.id)
    assert len(task.notes) == 0


async def test_removed_note_is_deleted_in_the_database(
    session: AsyncSession,
    task: schemas.Task,
    note: schemas.Note,
):
    """Test that a removed note is deleted in the database."""
    await api.tasks.add_note_to_task(session, task.id, note.id)
    await api.tasks.remove_note_from_task(session, task.id, note.id)

    stmt = select(models.TaskNote).where(
        tuple_(
            models.TaskNote.task_id,
            models.TaskNote.note_id,
        )
        == (task.id, note.id),
    )
    result = await session.execute(stmt)
    db_task_note = result.unique().scalars().one_or_none()
    assert db_task_note is None
