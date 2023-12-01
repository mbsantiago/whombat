"""Python API for user annotations."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import common, notes, sound_events, tags, users
from whombat.api.tasks import _add_tag_to_project
from whombat.filters.base import Filter

__all__ = [
    "add_tag",
    "add_note",
    "create",
    "delete",
    "get_by_id",
    "get_by_uuid",
    "get_many",
    "remove_tag",
    "remove_note",
]


caches = cache.CacheCollection(schemas.Annotation)


@caches.cached(
    name="annotation_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_id: annotation_id,
    data_key=lambda annotation: annotation.id,
)
async def get_by_id(
    session: AsyncSession, annotation_id: int
) -> schemas.Annotation:
    """Get an annotation project by its ID."""
    annotation = await common.get_object(
        session,
        models.Annotation,
        models.Annotation.id == annotation_id,
    )
    return schemas.Annotation.model_validate(annotation)


@caches.cached(
    name="annotation_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_uuid: annotation_uuid,
    data_key=lambda annotation: annotation.uuid,
)
async def get_by_uuid(
    session: AsyncSession, annotation_uuid: UUID
) -> schemas.Annotation:
    """Get an annotation project by its UUID."""
    annotation = await common.get_object(
        session,
        models.Annotation,
        models.Annotation.uuid == annotation_uuid,
    )
    return schemas.Annotation.model_validate(annotation)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.Annotation], int]:
    """Get all annotation projects."""
    annotations, count = await common.get_objects(
        session,
        models.Annotation,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [schemas.Annotation.model_validate(ap) for ap in annotations], count


@caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.AnnotationPostCreate,
    tag_ids: list[int] | None = None,
) -> schemas.Annotation:
    """Create an annotation object."""
    await common.get_object(
        session, models.Task, models.Task.id == data.task_id
    )
    await common.get_object(
        session, models.User, models.User.id == data.created_by_id
    )
    await common.get_object(
        session, models.SoundEvent, models.SoundEvent.id == data.sound_event_id
    )
    annotation = await common.create_object(
        session,
        models.Annotation,
        data,
    )

    if tag_ids:
        await common.create_objects(
            session,
            models.AnnotationTag,
            [
                schemas.AnnotationTagCreate(
                    annotation_id=annotation.id,
                    tag_id=tag_id,
                    created_by_id=data.created_by_id,
                )
                for tag_id in tag_ids
            ],
        )

    await session.refresh(annotation)
    return schemas.Annotation.model_validate(annotation)


@caches.with_clear
async def delete(
    session: AsyncSession,
    annotation_id: int,
) -> schemas.Annotation:
    """Delete an annotation project."""
    annotation = await common.delete_object(
        session,
        models.Annotation,
        models.Annotation.id == annotation_id,
    )
    return schemas.Annotation.model_validate(annotation)


@caches.with_update
async def add_tag(
    session: AsyncSession,
    annotation_id: int,
    tag_id: int,
    user_id: UUID,
) -> schemas.Annotation:
    """Add a tag to an annotation project."""
    annotation = await get_by_id(session, annotation_id)

    for annotation_tag in annotation.tags:
        if (
            annotation_tag.tag.id == tag_id
            and annotation_tag.created_by_id == user_id
        ):
            return annotation

    obj = await common.create_object(
        session,
        models.AnnotationTag,
        schemas.AnnotationTagCreate(
            annotation_id=annotation_id,
            tag_id=tag_id,
            created_by_id=user_id,
        ),
    )

    # Add tag to project if it is not already there
    await _add_tag_to_project(session, annotation.task_id, tag_id)

    await session.refresh(obj)
    new_tag = schemas.AnnotationTag.model_validate(obj)
    annotation.tags.append(new_tag)
    return annotation


@caches.with_update
async def add_note(
    session: AsyncSession,
    annotation_id: int,
    note_id: int,
) -> schemas.Annotation:
    """Add a note to an annotation project."""
    annotation = await common.add_note_to_object(
        session,
        models.Annotation,
        models.Annotation.id == annotation_id,
        note_id,
    )
    return schemas.Annotation.model_validate(annotation)


@caches.with_update
async def remove_tag(
    session: AsyncSession,
    annotation_id: int,
    tag_id: int,
) -> schemas.Annotation:
    """Remove a tag from an annotation project."""
    annotation = await get_by_id(session, annotation_id)

    for annotation_tag in annotation.tags:
        if annotation_tag.id != tag_id:
            continue

        await common.delete_object(
            session,
            models.AnnotationTag,
            models.AnnotationTag.id == tag_id,
        )

        annotation.tags = [tag for tag in annotation.tags if tag.id != tag_id]
        return annotation

    return annotation


@caches.with_update
async def remove_note(
    session: AsyncSession,
    annotation_id: int,
    note_id: int,
) -> schemas.Annotation:
    """Remove a note from an annotation project."""
    annotation = await common.remove_note_from_object(
        session,
        models.Annotation,
        models.Annotation.id == annotation_id,
        note_id,
    )
    return schemas.Annotation.model_validate(annotation)


async def get_notes(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.AnnotationNote], int]:
    """Get a page of annotation notes.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    limit : int, optional
        Maximum number of notes to return, by default 100

    offset : int, optional
        Number of notes to skip, by default 0

    filters : Sequence[Filter], optional
        Filters to apply to the query, by default None

    sort_by : str, optional
        Field to sort by, by default "-created_at"

    Returns
    -------
    schemas.AnnotationNoteList
        List of annotation notes.

    count : int
        Total number of notes that match the filters.
    """
    notes, count = await common.get_objects(
        session,
        models.AnnotationNote,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return (
        [schemas.AnnotationNote.model_validate(note) for note in notes],
        count,
    )


async def get_tags(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_at",
) -> tuple[list[schemas.AnnotationTag], int]:
    """Get a page of annotation tags.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.

    limit : int, optional
        Maximum number of tags to return, by default 100

    offset : int, optional
        Number of tags to skip, by default 0

    filters : Sequence[Filter], optional
        Filters to apply to the query, by default None

    sort_by : str, optional
        Field to sort by, by default "-created_at"

    Returns
    -------
    schemas.AnnotationTagList
        List of annotation tags.

    count : int
        Total number of tags that match the filters.
    """
    tags, count = await common.get_objects(
        session,
        models.AnnotationTag,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return (
        [schemas.AnnotationTag.model_validate(tag) for tag in tags],
        count,
    )


async def create_from_soundevent(
    session: AsyncSession,
    sound_event_annotation: data.SoundEventAnnotation,
    task_id: int,
) -> schemas.Annotation:
    """Create an annotation from a sound event annotation.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.
    sound_event_annotation : data.SoundEventAnnotation
        The sound event annotation to create the annotation from.
    task_id : int
        The ID of the task to add the annotation to.

    Returns
    -------
    schemas.Annotation
        The created annotation.
    """

    if sound_event_annotation.created_by is None:
        user = await users.get_anonymous_user(session)
    else:
        user = await users.from_soundevent(
            session, sound_event_annotation.created_by
        )

    task = await common.get_object(
        session,
        models.Task,
        models.Task.id == task_id,
    )

    sound_event = await sound_events.from_soundevent(
        session,
        sound_event_annotation.sound_event,
        task.clip.recording.id,
    )

    annotation = await create(
        session,
        schemas.AnnotationPostCreate(
            created_by_id=user.id,
            sound_event_id=sound_event.id,
            task_id=task.id,
            created_at=sound_event_annotation.created_on,
        ),
    )

    for se_tag in sound_event_annotation.tags:
        tag = await tags.from_soundevent(session, se_tag)
        annotation = await add_tag(session, annotation.id, tag.id, user.id)

    for se_note in sound_event_annotation.notes:
        note = await notes.from_soundevent(session, se_note)
        annotation = await add_note(session, annotation.id, note.id)

    return annotation


async def update_from_soundevent(
    session: AsyncSession,
    annotation: schemas.Annotation,
    sound_event_annotation: data.SoundEventAnnotation,
) -> schemas.Annotation:
    """Update an annotation from a sound event annotation.

    This function will add any tags or notes that are in the sound event
    annotation but not in the annotation. It will not remove any tags or notes.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation
        The annotation to update.
    sound_event_annotation
        The sound event annotation to update the annotation from.

    Returns
    -------
    schemas.Annotation
        The updated annotation.

    Notes
    -----
    Since `soundevent` annotation tags do not store the user that created them,
    any tag that is added to the annotation will be attributed to the creator
    of the annotation.
    """
    if not annotation.uuid == sound_event_annotation.uuid:
        raise ValueError(
            "Annotation UUID does not match SoundEventAnnotation UUID"
        )

    tag_keys = {(t.tag.key, t.tag.value) for t in annotation.tags}
    note_keys = {n.uuid for n in annotation.notes}

    for se_tag in sound_event_annotation.tags:
        if (se_tag.key, se_tag.value) in tag_keys:
            continue

        tag = await tags.from_soundevent(session, se_tag)
        annotation = await add_tag(
            session,
            annotation.id,
            tag.id,
            annotation.created_by.id,
        )

    for se_note in sound_event_annotation.notes:
        if se_note.uuid in note_keys:
            continue

        note = await notes.from_soundevent(session, se_note)
        annotation = await add_note(session, annotation.id, note.id)

    return annotation


async def from_soundevent(
    session: AsyncSession,
    sound_event_annotation: data.SoundEventAnnotation,
    task_id: int,
) -> schemas.Annotation:
    """Get or create an annotation from a `soundevent` annotation.

    If an annotation with the same UUID already exists, it will be updated
    with any tags or notes that are in the `soundevent` annotation but not in
    current state of the annotation.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.
    sound_event_annotation : data.SoundEventAnnotation
        The sound event annotation to create the annotation from.
    task_id : int
        The ID of the task to add the annotation to.

    Returns
    -------
    schemas.Annotation
        The created annotation.
    """
    try:
        annotation = await get_by_uuid(session, sound_event_annotation.uuid)
        return await update_from_soundevent(
            session, annotation, sound_event_annotation
        )
    except exceptions.NotFoundError:
        pass

    return await create_from_soundevent(
        session, sound_event_annotation, task_id
    )
