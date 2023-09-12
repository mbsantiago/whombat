"""REST API routes for notes."""
from fastapi import APIRouter

from whombat import api, schemas
from whombat.dependencies import Session

__all__ = [
    "notes_router",
]

notes_router = APIRouter()


@notes_router.patch(
    "/detail/",
    response_model=schemas.Note,
)
async def update_note(
    session: Session,
    note_id: int,
    data: schemas.NoteUpdate,
):
    """Update a note."""
    updated = await api.notes.update(
        session,
        note_id,
        data,
    )
    await session.commit()
    return updated
