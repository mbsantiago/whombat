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
) -> tuple[Sequence[schemas.Annotation], int]:
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
    session: AsyncSession, data: schemas.AnnotationCreate
) -> schemas.Annotation:
    """Create an annotation project."""
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
) -> schemas.Annotation:
    """Add a tag to an annotation project."""
    annotation = await common.add_tag_to_object(
        session,
        models.Annotation,
        models.Annotation.id == annotation_id,
        tag_id,
    )
    return schemas.Annotation.model_validate(annotation)


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
    annotation = await common.remove_tag_from_object(
        session,
        models.Annotation,
        models.Annotation.id == annotation_id,
        tag_id,
    )
    return schemas.Annotation.model_validate(annotation)


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
