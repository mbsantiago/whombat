"""Python API for user annotations."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, models, schemas
from whombat.api import common
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
    await session.refresh(obj)
    new_tag = schemas.AnnotationTag.model_validate(obj)
    annotation.tags.append(new_tag)
    print(annotation.sound_event.geometry)
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
