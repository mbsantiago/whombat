"""REST API routes for notes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.clip_annotation_notes import ClipAnnotationNoteFilter
from whombat.filters.notes import NoteFilter
from whombat.filters.recording_notes import RecordingNoteFilter
from whombat.filters.sound_event_annotation_notes import (
    SoundEventAnnotationNoteFilter,
)
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

__all__ = [
    "notes_router",
]

notes_router = APIRouter()


@notes_router.get(
    "/",
    response_model=schemas.Page[schemas.Note],
)
async def get_notes(
    session: Session,
    filter: Annotated[
        NoteFilter,  # type: ignore
        Depends(NoteFilter),
    ],
    limit: Limit = 100,
    offset: Offset = 0,
    sort_by: str | None = "-created_on",
):
    """Get all tags."""
    notes, total = await api.notes.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=notes,
        total=total,
        limit=limit,
        offset=offset,
    )


@notes_router.get(
    "/detail/",
    response_model=schemas.Note,
)
async def get_note(
    session: Session,
    note_uuid: UUID,
):
    """Update a note."""
    note = await api.notes.get(session, note_uuid)
    return note


@notes_router.patch(
    "/detail/",
    response_model=schemas.Note,
)
async def update_note(
    session: Session,
    note_uuid: UUID,
    data: schemas.NoteUpdate,
):
    """Update a note."""
    note = await api.notes.get(session, note_uuid)
    updated = await api.notes.update(
        session,
        note,
        data,
    )
    await session.commit()
    return updated


@notes_router.delete(
    "/detail/",
    response_model=schemas.Note,
)
async def delete_note(
    session: Session,
    note_uuid: UUID,
):
    """Update a note."""
    note = await api.notes.get(session, note_uuid)
    await api.notes.delete(session, note)
    await session.commit()
    return note


@notes_router.get(
    "/recording_notes/",
    response_model=schemas.Page[schemas.RecordingNote],
)
async def get_recording_notes(
    session: Session,
    filter: Annotated[RecordingNoteFilter, Depends(RecordingNoteFilter)],  # type: ignore
    limit: Limit = 100,
    offset: Offset = 0,
    sort_by: str | None = "recording_id",
):
    """Get all recording notes."""
    notes, total = await api.notes.get_recording_notes(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=notes,
        total=total,
        limit=limit,
        offset=offset,
    )


@notes_router.get(
    "/clip_annotation_notes/",
    response_model=schemas.Page[schemas.ClipAnnotationNote],
)
async def get_clip_annotation_notes(
    session: Session,
    filter: Annotated[
        ClipAnnotationNoteFilter,  # type: ignore
        Depends(ClipAnnotationNoteFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_on",
) -> schemas.Page[schemas.ClipAnnotationNote]:
    """Get a page of annotation notes."""
    (
        notes,
        total,
    ) = await api.notes.get_clip_annotation_notes(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=notes,
        total=total,
        limit=limit,
        offset=offset,
    )


@notes_router.get(
    "/sound_event_annotation_notes/",
    response_model=schemas.Page[schemas.SoundEventAnnotationNote],
)
async def get_sound_event_annotation_notes(
    session: Session,
    filter: Annotated[
        SoundEventAnnotationNoteFilter,  # type: ignore
        Depends(SoundEventAnnotationNoteFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_on",
) -> schemas.Page[schemas.SoundEventAnnotationNote]:
    """Get a page of annotation notes."""
    (
        notes,
        total,
    ) = await api.notes.get_sound_event_annotation_notes(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=notes,
        total=total,
        limit=limit,
        offset=offset,
    )
