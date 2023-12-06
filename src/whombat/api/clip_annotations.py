"""Python API for clip annotations."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import clips, common, notes, sound_event_annotations, tags
from whombat.filters.base import Filter

__all__ = [
    "get_by_id",
    "get_by_uuid",
    "get_many",
    "create",
    "delete",
    "add_tag",
    "remove_tag",
    "add_note",
    "remove_note",
    "from_soundevent",
    "to_soundevent",
]


caches = cache.CacheCollection(schemas.ClipAnnotation)


@caches.cached(
    name="clip_annotation_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, clip_annotation_id: clip_annotation_id,
    data_key=lambda clip_annotation: clip_annotation.id,
)
async def get_by_id(
    session: AsyncSession,
    clip_annotation_id: int,
) -> schemas.ClipAnnotation:
    """Get a clip annotation by its ID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    clip_annotation_id : int
        The ID of the clip annotation.

    Returns
    -------
    schemas.ClipAnnotation
        The clip annotation.

    Raises
    ------
    exceptions.NotFoundError
        If the clip annotation does not exist.
    """
    clip_annotation = await common.get_object(
        session=session,
        model=models.ClipAnnotation,
        condition=models.ClipAnnotation.id == clip_annotation_id,
    )
    return schemas.ClipAnnotation.model_validate(clip_annotation)


@caches.cached(
    name="clip_annotation_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, uuid: uuid,
    data_key=lambda clip_annotation: clip_annotation.uuid,
)
async def get_by_uuid(
    session: AsyncSession,
    uuid: UUID,
) -> schemas.ClipAnnotation:
    """Get a clip annotation by its UUID.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    uuid : UUID
        The UUID of the clip annotation.

    Returns
    -------
    schemas.ClipAnnotation
        The clip annotation.

    Raises
    ------
    exceptions.NotFoundError
        If the clip annotation does not exist.
    """
    clip_annotation = await common.get_object(
        session=session,
        model=models.ClipAnnotation,
        condition=models.ClipAnnotation.uuid == uuid,
    )
    return schemas.ClipAnnotation.model_validate(clip_annotation)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.ClipAnnotation], int]:
    """Get many clip annotations.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    limit : int, optional
        The maximum number of annotations to return, by default 1000
    offset : int, optional
        The offset to start returning annotations from, by default 0
    filters : Sequence[Filter], optional
        A list of filters to apply to the annotations, by default None
    sort_by : str, optional
        The field to sort the annotations by, by default "-created_on"

    Returns
    -------
    clip_annotations : list[schemas.ClipAnnotation]
        The clip annotations that match the given filters. If limit
        is set only the first limit annotations will be returned,
        considering the offset.
    count : int
        The total number of annotations that match the given filters.
    """
    annotations, count = await common.get_objects(
        session,
        models.ClipAnnotation,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.ClipAnnotation.model_validate(ap) for ap in annotations
    ], count


@caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.ClipAnnotationCreate,
) -> schemas.ClipAnnotation:
    """Create a clip annotation.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    data : schemas.ClipAnnotationCreate
        The clip annotation to create.

    Returns
    -------
    schemas.ClipAnnotation
        The created clip annotation.
    """
    # Check related objects exist
    await common.get_object(
        session=session,
        model=models.Clip,
        condition=models.Clip.id == data.clip_id,
    )
    clip_annotation = await common.create_object(
        session=session,
        model=models.ClipAnnotation,
        data=data,
    )
    return schemas.ClipAnnotation.model_validate(clip_annotation)


async def delete(
    session: AsyncSession,
    clip_annotation_id: int,
) -> None:
    """Delete a clip annotation.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    clip_annotation_id : int
        The ID of the clip annotation to delete.

    Raises
    ------
    exceptions.NotFoundError
        If the clip annotation does not exist.
    """
    await common.delete_object(
        session=session,
        model=models.ClipAnnotation,
        condition=models.ClipAnnotation.id == clip_annotation_id,
    )


async def add_tag(
    session: AsyncSession,
    clip_annotation_id: int,
    tag_id: int,
    user_id: UUID | None = None,
) -> schemas.ClipAnnotation:
    """Add a tag to a clip annotation.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    clip_annotation_id : int
        The ID of the clip annotation to add the tag to.
    tag_id : int
        The ID of the tag to add to the clip annotation.
    user_id : UUID, optional
        The ID of the user adding the tag, by default None.

    Returns
    -------
    schemas.ClipAnnotation
        The updated clip annotation.

    Raises
    ------
    exceptions.NotFoundError
        If the clip annotation or tag do not exist.
    """
    # Check related objects exist
    clip_annotation = await common.get_object(
        session=session,
        model=models.ClipAnnotation,
        condition=models.ClipAnnotation.id == clip_annotation_id,
    )

    for tag in clip_annotation.clip_annotation_tags:
        if tag.tag_id == tag_id and tag.created_by_id == user_id:
            return schemas.ClipAnnotation.model_validate(clip_annotation)

    await common.create_object(
        session=session,
        model=models.ClipAnnotationTag,
        data=schemas.ClipAnnotationTagCreate(
            annotation_id=clip_annotation_id,
            tag_id=tag_id,
            created_by_id=user_id,
        ),
    )

    await session.refresh(clip_annotation)
    return schemas.ClipAnnotation.model_validate(clip_annotation)


async def add_note(
    session: AsyncSession,
    clip_annotation_id: int,
    note_id: int,
) -> schemas.ClipAnnotation:
    """Add a note to a clip annotation.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    clip_annotation_id : int
        The ID of the clip annotation to add the note to.

    Returns
    -------
    schemas.ClipAnnotation
        The updated clip annotation.

    Raises
    ------
    exceptions.NotFoundError
        If the clip annotation or note do not exist.
    """
    # Check related objects exist
    clip_annotation = await common.get_object(
        session=session,
        model=models.ClipAnnotation,
        condition=models.ClipAnnotation.id == clip_annotation_id,
    )

    for note in clip_annotation.clip_annotation_notes:
        if note.note_id == note_id:
            return schemas.ClipAnnotation.model_validate(clip_annotation)

    await common.create_object(
        session=session,
        model=models.ClipAnnotationNote,
        data=schemas.ClipAnnotationNoteCreate(
            annotation_id=clip_annotation_id,
            note_id=note_id,
        ),
    )

    await session.refresh(clip_annotation)
    return schemas.ClipAnnotation.model_validate(clip_annotation)


async def remove_tag(
    session: AsyncSession,
    clip_annotation_id: int,
    tag_id: int,
    user_id: UUID,
) -> schemas.ClipAnnotation:
    """Remove a tag from a clip annotation.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    clip_annotation_id : int
        The ID of the clip annotation to remove the tag from.
    tag_id : int
        The ID of the tag to remove from the clip annotation.

    Returns
    -------
    schemas.ClipAnnotation
        The updated clip annotation.

    Raises
    ------
    exceptions.NotFoundError
        If the clip annotation or tag do not exist.
    """
    # Check related objects exist
    clip_annotation = await common.get_object(
        session=session,
        model=models.ClipAnnotation,
        condition=models.ClipAnnotation.id == clip_annotation_id,
    )

    for tag in clip_annotation.clip_annotation_tags:
        if tag.tag_id == tag_id and tag.created_by_id == user_id:
            await session.delete(tag)
            await session.refresh(clip_annotation)

    return schemas.ClipAnnotation.model_validate(clip_annotation)


async def remove_note(
    session: AsyncSession,
    clip_annotation_id: int,
    note_id: int,
) -> schemas.ClipAnnotation:
    """Remove a note from a clip annotation.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    clip_annotation_id : int
        The ID of the clip annotation to remove the note from.
    note_id : int
        The ID of the note to remove from the clip annotation.

    Returns
    -------
    schemas.ClipAnnotation
        The updated clip annotation.

    Raises
    ------
    exceptions.NotFoundError
        If the clip annotation or note do not exist.
    """
    # Check related objects exist
    clip_annotation = await common.get_object(
        session=session,
        model=models.ClipAnnotation,
        condition=models.ClipAnnotation.id == clip_annotation_id,
    )

    for note in clip_annotation.clip_annotation_notes:
        if note.note_id == note_id:
            await session.delete(note)
            await session.refresh(clip_annotation)

    return schemas.ClipAnnotation.model_validate(clip_annotation)


async def update_from_soundevent(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    data: data.ClipAnnotation,
) -> schemas.ClipAnnotation:
    """Update a clip annotation from a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    clip_annotation : models.ClipAnnotation
        The clip annotation to update.
    data : data.ClipAnnotation
        The clip annotation data to update with.

    Returns
    -------
    schemas.ClipAnnotation
        The updated clip annotation.
    """
    if not clip_annotation.uuid == data.uuid:
        raise ValueError("The UUID's do not match.")

    tag_keys = {(t.tag.key, t.tag.value) for t in clip_annotation.tags}
    note_keys = {n.uuid for n in clip_annotation.notes}

    for se_tag in data.tags:
        if (se_tag.key, se_tag.value) in tag_keys:
            continue

        tag = await tags.from_soundevent(session, se_tag)
        clip_annotation = await add_tag(
            session,
            clip_annotation.id,
            tag.id,
        )

    for se_note in data.notes:
        if se_note.uuid in note_keys:
            continue

        note = await notes.from_soundevent(session, se_note)
        clip_annotation = await add_note(
            session,
            clip_annotation.id,
            note.id,
        )

    for sound_event in data.sound_events:
        await sound_event_annotations.from_soundevent(
            session,
            sound_event,
            clip_annotation.id,
        )

    return clip_annotation


async def create_from_soundevent(
    session: AsyncSession,
    data: data.ClipAnnotation,
) -> schemas.ClipAnnotation:
    """Create a clip annotation from a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    data : data.ClipAnnotation
        The clip annotation to create.

    Returns
    -------
    schemas.ClipAnnotation
        The created clip annotation.
    """
    clip = await clips.from_soundevent(session, data.clip)
    clip_annotation = await create(
        session,
        schemas.ClipAnnotationCreate(
            uuid=data.uuid,
            clip_id=clip.id,
            created_on=data.created_on,
        ),
    )

    for se_tag in data.tags:
        tag = await tags.from_soundevent(session, se_tag)
        clip_annotation = await add_tag(
            session,
            clip_annotation.id,
            tag.id,
        )

    for se_note in data.notes:
        note = await notes.from_soundevent(session, se_note)
        clip_annotation = await add_note(
            session,
            clip_annotation.id,
            note.id,
        )

    for sound_event in data.sound_events:
        await sound_event_annotations.from_soundevent(
            session,
            sound_event,
            clip_annotation.id,
        )

    return clip_annotation


async def from_soundevent(
    session: AsyncSession, data: data.ClipAnnotation
) -> schemas.ClipAnnotation:
    """Create a clip annotation from a sound event.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    data : data.ClipAnnotation
        The clip annotation to create.

    Returns
    -------
    schemas.ClipAnnotation
        The created clip annotation.
    """
    try:
        clip_annotation = await get_by_uuid(session, data.uuid)
        return await update_from_soundevent(
            session,
            clip_annotation,
            data,
        )
    except exceptions.NotFoundError:
        pass

    return await create_from_soundevent(session, data)


def to_soundevent(
    clip_annotation: schemas.ClipAnnotation,
) -> data.ClipAnnotation:
    """Convert a clip annotation to a soundevent object.

    Parameters
    ----------
    clip_annotation : schemas.ClipAnnotation
        The clip annotation to convert.

    Returns
    -------
    data.ClipAnnotation
        The converted object in the soundevent format.
    """
    se_clip = clips.to_soundevent(clip_annotation.clip)
    se_sound_events = [
        sound_event_annotations.to_soundevent(
            annotation,
        )
        for annotation in clip_annotation.sound_events
    ]
    se_tags = [tags.to_soundevent(tag.tag) for tag in clip_annotation.tags]
    se_notes = [notes.to_soundevent(note) for note in clip_annotation.notes]

    return data.ClipAnnotation(
        uuid=clip_annotation.uuid,
        created_on=clip_annotation.created_on,
        clip=se_clip,
        sound_events=se_sound_events,
        tags=se_tags,
        notes=se_notes,
    )
