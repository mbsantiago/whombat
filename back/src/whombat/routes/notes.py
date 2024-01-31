"""REST API routes for notes."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.notes import NoteFilter
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
    limit: Limit = 100,
    offset: Offset = 0,
    sort_by: str | None = "-created_on",
    filter: NoteFilter = Depends(NoteFilter),  # type: ignore
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
