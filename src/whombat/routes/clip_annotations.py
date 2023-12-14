"""REST API routes for clip_annotations."""
from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import ActiveUser, Session
from whombat.filters.clip_annotations import ClipAnnotationFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "clip_annotations_router",
]


clip_annotations_router = APIRouter()


@clip_annotations_router.post(
    "/",
    response_model=schemas.ClipAnnotation,
)
async def create_annotation(
    session: Session,
    clip_uuid: UUID,
):
    """Create annotation."""
    clip = await api.clips.get(session, clip_uuid)
    clip_annotation = await api.clip_annotations.create(
        session,
        clip=clip,
    )
    await session.commit()
    return clip_annotation


@clip_annotations_router.get(
    "/",
    response_model=schemas.Page[schemas.ClipAnnotation],
)
async def get_clip_annotations(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    filter: ClipAnnotationFilter = Depends(ClipAnnotationFilter),  # type: ignore
    sort_by: str = "-created_on",
):
    """Get a page of annotation clip_annotations."""
    (
        clip_annotations,
        total,
    ) = await api.clip_annotations.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=clip_annotations,
        total=total,
        limit=limit,
        offset=offset,
    )


@clip_annotations_router.get(
    "/detail/",
    response_model=schemas.ClipAnnotation,
)
async def get_annotation(
    session: Session,
    clip_annotation_uuid: UUID,
):
    """Get an annotation annotation."""
    clip_annotation = await api.clip_annotations.get(
        session,
        clip_annotation_uuid,
    )
    return clip_annotation


@clip_annotations_router.delete(
    "/detail/",
    response_model=schemas.ClipAnnotation,
)
async def delete_annotation(
    session: Session,
    clip_annotation_uuid: UUID,
):
    """Remove a clip from an annotation project."""
    clip_annotation = await api.clip_annotations.get(
        session,
        clip_annotation_uuid,
    )
    clip_annotaiton = await api.clip_annotations.delete(
        session,
        clip_annotation,
    )
    await session.commit()
    return clip_annotaiton


@clip_annotations_router.post(
    "/detail/tags/",
    response_model=schemas.ClipAnnotation,
)
async def add_annotation_tag(
    session: Session,
    clip_annotation_uuid: UUID,
    key: str,
    value: str,
    user: ActiveUser,
):
    """Add a tag to an annotation annotation."""
    clip_annotation = await api.clip_annotations.get(
        session,
        clip_annotation_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    clip_annotation = await api.clip_annotations.add_tag(
        session,
        clip_annotation,
        tag,
        user,
    )
    await session.commit()
    return clip_annotation


@clip_annotations_router.delete(
    "/detail/tags/",
    response_model=schemas.ClipAnnotation,
)
async def remove_annotation_tag(
    session: Session,
    clip_annotation_uuid: UUID,
    key: str,
    value: str,
    user_uuid: UUID | None = None,
):
    """Remove a tag from an annotation annotation."""
    clip_annotation = await api.clip_annotations.get(
        session,
        clip_annotation_uuid,
    )
    tag = await api.tags.get(session, (key, value))
    user = None
    if user_uuid:
        user = await api.users.get(session, user_uuid)
    clip_annotation = await api.clip_annotations.remove_tag(
        session,
        clip_annotation,
        tag,
        user,
    )
    await session.commit()
    return clip_annotation


@clip_annotations_router.post(
    "/detail/notes/",
    response_model=schemas.ClipAnnotation,
)
async def create_annotation_note(
    session: Session,
    clip_annotation_uuid: UUID,
    data: schemas.NoteCreate,
    user: ActiveUser,
):
    """Create a note for an annotation annotation."""
    clip_annotation = await api.clip_annotations.get(
        session,
        clip_annotation_uuid,
    )
    note = await api.notes.create(
        session,
        message=data.message,
        is_issue=data.is_issue,
        created_by_id=user.id,
    )
    clip_annotation = await api.clip_annotations.add_note(
        session,
        clip_annotation,
        note,
    )
    await session.commit()
    return clip_annotation


@clip_annotations_router.delete(
    "/detail/notes/",
    response_model=schemas.ClipAnnotation,
)
async def delete_annotation_note(
    session: Session,
    clip_annotation_uuid: UUID,
    note_uuid: UUID,
):
    """Delete a note from an annotation annotation."""
    clip_annotation = await api.clip_annotations.get(
        session,
        clip_annotation_uuid,
    )
    note = await api.notes.get(session, note_uuid)
    clip_annotation = await api.clip_annotations.remove_note(
        session,
        clip_annotation,
        note,
    )
    await session.commit()
    return clip_annotation
