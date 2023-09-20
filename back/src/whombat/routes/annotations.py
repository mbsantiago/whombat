"""REST API routes for annotations."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import ActiveUser, Session
from whombat.filters.annotation_notes import AnnotationNoteFilter
from whombat.filters.annotation_tags import AnnotationTagFilter
from whombat.filters.annotations import AnnotationFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "annotations_router",
]


annotations_router = APIRouter()


@annotations_router.post(
    "/",
    response_model=schemas.Annotation,
)
async def create_annotation(
    session: Session,
    data: schemas.AnnotationCreate,
    user: ActiveUser,
):
    """Create annotation."""
    task = await api.tasks.get_by_id(session, data.task_id)

    # Create the corresponding sound event
    sound_event = await api.sound_events.create(
        session,
        schemas.SoundEventCreate(
            recording_id=task.clip.recording_id,
            geometry=data.geometry,
        ),
    )

    # Create the annotation
    annotation = await api.annotations.create(
        session,
        schemas.AnnotationPostCreate(
            task_id=task.id,
            created_by_id=user.id,
            sound_event_id=sound_event.id,
        ),
    )
    await session.commit()
    return annotation


@annotations_router.get(
    "/",
    response_model=schemas.Page[schemas.Annotation],
)
async def get_annotations(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: AnnotationFilter = Depends(AnnotationFilter),  # type: ignore
    sort_by: str = "-created_at",
):
    """Get a page of annotation annotations."""
    annotations, total = await api.annotations.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=annotations,
        total=total,
        limit=limit,
        offset=offset,
    )


@annotations_router.delete(
    "/detail/",
    response_model=schemas.Annotation,
)
async def delete_annotation(
    session: Session,
    annotation_id: int,
):
    """Remove a clip from an annotation project."""
    annotation = await api.annotations.delete(session, annotation_id)
    await session.commit()
    return annotation


@annotations_router.post(
    "/detail/notes/",
    response_model=schemas.Annotation,
)
async def create_annotation_note(
    session: Session,
    annotation_id: int,
    data: schemas.NoteCreate,
    user: ActiveUser,
):
    """Create a note for an annotation annotation."""
    note = await api.notes.create(
        session,
        schemas.NotePostCreate(
            created_by_id=user.id,
            **data.model_dump(),
        ),
    )
    annotation = await api.annotations.add_note(
        session,
        annotation_id,
        note.id,
    )
    await session.commit()
    return annotation


@annotations_router.delete(
    "/detail/notes/",
    response_model=schemas.Annotation,
)
async def delete_annotation_note(
    session: Session,
    annotation_id: int,
    note_id: int,
):
    """Delete a note from an annotation annotation."""
    annotation = await api.annotations.remove_note(
        session,
        annotation_id,
        note_id,
    )
    await session.commit()
    return annotation


@annotations_router.get(
    "/notes/",
    response_model=schemas.Page[schemas.AnnotationNote],
)
async def get_annotation_notes(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: AnnotationNoteFilter = Depends(AnnotationNoteFilter),  # type: ignore
):
    """Get a page of annotation notes."""
    notes, total = await api.annotations.get_notes(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=notes,
        total=total,
        offset=offset,
        limit=limit,
    )


@annotations_router.get(
    "/tags/",
    response_model=schemas.Page[schemas.AnnotationTag],
)
async def get_annotation_tags(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: AnnotationTagFilter = Depends(AnnotationTagFilter),  # type: ignore
):
    """Get a page of annotation tags."""
    tags, total = await api.annotations.get_tags(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tags,
        total=total,
        offset=offset,
        limit=limit,
    )
