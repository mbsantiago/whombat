"""Python API for sound event annotations."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import common, notes, sound_events, tags, users
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
    "get_notes",
    "get_tags",
    "create_from_soundevent",
    "update_from_soundevent",
    "from_soundevent",
    "to_soundevent",
]


caches = cache.CacheCollection(schemas.SoundEventAnnotation)


@caches.cached(
    name="annotation_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_id: annotation_id,
    data_key=lambda annotation: annotation.id,
)
async def get_by_id(
    session: AsyncSession, annotation_id: int
) -> schemas.SoundEventAnnotation:
    """Get an annotation project by its ID."""
    annotation = await common.get_object(
        session,
        models.SoundEventAnnotation,
        models.SoundEventAnnotation.id == annotation_id,
    )
    return schemas.SoundEventAnnotation.model_validate(annotation)


@caches.cached(
    name="annotation_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_uuid: annotation_uuid,
    data_key=lambda annotation: annotation.uuid,
)
async def get_by_uuid(
    session: AsyncSession, annotation_uuid: UUID
) -> schemas.SoundEventAnnotation:
    """Get an annotation project by its UUID."""
    annotation = await common.get_object(
        session,
        models.SoundEventAnnotation,
        models.SoundEventAnnotation.uuid == annotation_uuid,
    )
    return schemas.SoundEventAnnotation.model_validate(annotation)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.SoundEventAnnotation], int]:
    """Get all annotation projects."""
    annotations, count = await common.get_objects(
        session,
        models.SoundEventAnnotation,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.SoundEventAnnotation.model_validate(ap) for ap in annotations
    ], count


@caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.SoundEventAnnotationPostCreate,
    tag_ids: list[int] | None = None,
) -> schemas.SoundEventAnnotation:
    """Create a sound event annotation."""
    # Check that the user, sound event, and clip annotation exist
    await common.get_object(
        session,
        models.User,
        models.User.id == data.created_by_id,
    )
    await common.get_object(
        session,
        models.SoundEvent,
        models.SoundEvent.id == data.sound_event_id,
    )
    await common.get_object(
        session,
        models.ClipAnnotation,
        models.ClipAnnotation.id == data.clip_annotation_id,
    )

    annotation = await common.create_object(
        session,
        models.SoundEventAnnotation,
        data,
    )

    if tag_ids:
        await common.create_objects(
            session,
            models.SoundEventAnnotationTag,
            [
                schemas.SoundEventAnnotationTagCreate(
                    annotation_id=annotation.id,
                    tag_id=tag_id,
                    created_by_id=data.created_by_id,
                )
                for tag_id in tag_ids
            ],
        )

    await session.refresh(annotation)
    return schemas.SoundEventAnnotation.model_validate(annotation)


@caches.with_clear
async def delete(
    session: AsyncSession,
    annotation_id: int,
) -> schemas.SoundEventAnnotation:
    """Delete an annotation project."""
    annotation = await common.delete_object(
        session,
        models.SoundEventAnnotation,
        models.SoundEventAnnotation.id == annotation_id,
    )
    return schemas.SoundEventAnnotation.model_validate(annotation)


@caches.with_update
async def add_tag(
    session: AsyncSession,
    annotation_id: int,
    tag_id: int,
    user_id: UUID | None = None,
) -> schemas.SoundEventAnnotation:
    """Add a tag to an annotation project."""
    annotation = await common.get_object(
        session,
        models.SoundEventAnnotation,
        models.SoundEventAnnotation.id == annotation_id,
    )

    for annotation_tag in annotation.tags:
        if (
            annotation_tag.tag.id == tag_id
            and annotation_tag.created_by_id == user_id
        ):
            return schemas.SoundEventAnnotation.model_validate(annotation)

    await common.create_object(
        session,
        models.SoundEventAnnotationTag,
        schemas.SoundEventAnnotationTagCreate(
            annotation_id=annotation_id,
            tag_id=tag_id,
            created_by_id=user_id,
        ),
    )

    await session.refresh(annotation)
    return schemas.SoundEventAnnotation.model_validate(annotation)


@caches.with_update
async def add_note(
    session: AsyncSession,
    annotation_id: int,
    note_id: int,
) -> schemas.SoundEventAnnotation:
    """Add a note to an annotation project."""
    annotation = await common.add_note_to_object(
        session,
        models.SoundEventAnnotation,
        models.SoundEventAnnotation.id == annotation_id,
        note_id,
    )
    return schemas.SoundEventAnnotation.model_validate(annotation)


@caches.with_update
async def remove_tag(
    session: AsyncSession,
    annotation_id: int,
    tag_id: int,
) -> schemas.SoundEventAnnotation:
    """Remove a tag from an annotation project."""
    annotation = await get_by_id(session, annotation_id)

    for annotation_tag in annotation.tags:
        if annotation_tag.id != tag_id:
            continue

        await common.delete_object(
            session,
            models.SoundEventAnnotationTag,
            models.SoundEventAnnotationTag.id == tag_id,
        )

        annotation.tags = [tag for tag in annotation.tags if tag.id != tag_id]
        return annotation

    return annotation


@caches.with_update
async def remove_note(
    session: AsyncSession,
    annotation_id: int,
    note_id: int,
) -> schemas.SoundEventAnnotation:
    """Remove a note from an annotation project."""
    annotation = await common.remove_note_from_object(
        session,
        models.SoundEventAnnotation,
        models.SoundEventAnnotation.id == annotation_id,
        note_id,
    )
    return schemas.SoundEventAnnotation.model_validate(annotation)


async def get_notes(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.SoundEventAnnotationNote], int]:
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
        Field to sort by, by default "-created_on"

    Returns
    -------
    schemas.SoundEventAnnotationNoteList
        List of annotation notes.

    count : int
        Total number of notes that match the filters.
    """
    notes, count = await common.get_objects(
        session,
        models.SoundEventAnnotationNote,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return (
        [
            schemas.SoundEventAnnotationNote.model_validate(note)
            for note in notes
        ],
        count,
    )


async def get_tags(
    session: AsyncSession,
    *,
    limit: int = 100,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.SoundEventAnnotationTag], int]:
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
        Field to sort by, by default "-created_on"

    Returns
    -------
    schemas.SoundEventAnnotationTagList
        List of annotation tags.

    count : int
        Total number of tags that match the filters.
    """
    tags, count = await common.get_objects(
        session,
        models.SoundEventAnnotationTag,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return (
        [schemas.SoundEventAnnotationTag.model_validate(tag) for tag in tags],
        count,
    )


async def create_from_soundevent(
    session: AsyncSession,
    sound_event_annotation: data.SoundEventAnnotation,
    clip_annotation_id: int,
) -> schemas.SoundEventAnnotation:
    """Create an annotation from a sound event annotation.

    Parameters
    ----------
    session : AsyncSession
        SQLAlchemy AsyncSession.
    sound_event_annotation : data.SoundEventAnnotation
        The sound event annotation to create the annotation from.
    clip_annotation_id : int
        The ID of the clip annotation to add the annotation to.

    Returns
    -------
    schemas.SoundEventAnnotation
        The created annotation.
    """

    if sound_event_annotation.created_by is None:
        user = await users.get_anonymous_user(session)
    else:
        user = await users.from_soundevent(
            session, sound_event_annotation.created_by
        )

    clip_annotation = await common.get_object(
        session,
        models.ClipAnnotation,
        models.ClipAnnotation.id == clip_annotation_id,
    )

    sound_event = await sound_events.from_soundevent(
        session,
        sound_event_annotation.sound_event,
        clip_annotation.clip.recording.id,
    )

    annotation = await create(
        session,
        schemas.SoundEventAnnotationPostCreate(
            created_by_id=user.id,
            sound_event_id=sound_event.id,
            clip_annotation_id=clip_annotation.id,
            created_on=sound_event_annotation.created_on,
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
    sound_event_annotation: schemas.SoundEventAnnotation,
    data: data.SoundEventAnnotation,
) -> schemas.SoundEventAnnotation:
    """Update an annotation from a sound event annotation.

    This function will add any tags or notes that are in the sound event
    annotation but not in the annotation. It will not remove any tags or notes.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    sound_event_annotation
        The annotation to update.
    data
        The sound event annotation to update the annotation from.

    Returns
    -------
    schemas.SoundEventAnnotation
        The updated annotation.

    Notes
    -----
    Since `soundevent` annotation tags do not store the user that created them,
    any tag that is added to the annotation will be attributed to the creator
    of the annotation.
    """
    if not sound_event_annotation.uuid == data.uuid:
        raise ValueError(
            "Annotation UUID does not match SoundEventAnnotation UUID"
        )

    tag_keys = {(t.tag.key, t.tag.value) for t in sound_event_annotation.tags}
    note_keys = {n.uuid for n in sound_event_annotation.notes}

    for se_tag in data.tags:
        if (se_tag.key, se_tag.value) in tag_keys:
            continue

        tag = await tags.from_soundevent(session, se_tag)
        sound_event_annotation = await add_tag(
            session,
            sound_event_annotation.id,
            tag.id,
            user_id=sound_event_annotation.created_by.id
            if sound_event_annotation.created_by
            else None,
        )

    for se_note in data.notes:
        if se_note.uuid in note_keys:
            continue

        note = await notes.from_soundevent(session, se_note)
        sound_event_annotation = await add_note(
            session, sound_event_annotation.id, note.id
        )

    return sound_event_annotation


async def from_soundevent(
    session: AsyncSession,
    sound_event_annotation: data.SoundEventAnnotation,
    clip_annotation_id: int,
) -> schemas.SoundEventAnnotation:
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
    clip_annotation_id : int
        The ID of the clip annotation to add the annotation to.

    Returns
    -------
    schemas.SoundEventAnnotation
        The created annotation.
    """
    try:
        annotation = await get_by_uuid(session, sound_event_annotation.uuid)
        return await update_from_soundevent(
            session,
            annotation,
            sound_event_annotation,
        )
    except exceptions.NotFoundError:
        pass

    return await create_from_soundevent(
        session,
        sound_event_annotation,
        clip_annotation_id,
    )


def to_soundevent(
    annotation: schemas.SoundEventAnnotation,
) -> data.SoundEventAnnotation:
    """Convert an annotation to a `soundevent` annotation.

    Parameters
    ----------
    annotation : schemas.SoundEventAnnotation
        The annotation to convert.

    Returns
    -------
    data.SoundEventAnnotation
        The `soundevent` annotation.
    """
    return data.SoundEventAnnotation(
        uuid=annotation.uuid,
        created_on=annotation.created_on,
        created_by=users.to_soundevent(annotation.created_by)
        if annotation.created_by
        else None,
        sound_event=sound_events.to_soundevent(annotation.sound_event),
        tags=[tags.to_soundevent(t.tag) for t in annotation.tags],
        notes=[notes.to_soundevent(n) for n in annotation.notes],
    )
