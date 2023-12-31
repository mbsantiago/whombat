import uuid

from soundevent.io.aoef.note import NoteObject
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.common import create_objects_without_duplicates


async def import_notes(
    session: AsyncSession,
    notes: list[NoteObject],
    users: dict[uuid.UUID, uuid.UUID] | None = None,
) -> dict[uuid.UUID, int]:
    """Import a set of notes in AOEF format into the database."""
    if not notes:
        return {}

    if not users:
        users = {}

    values = []

    for note in notes:
        value = {
            "uuid": note.uuid,
            "message": note.message,
            "is_issue": note.is_issue,
        }

        if note.created_on:
            value["created_on"] = note.created_on

        if note.created_by:
            user_id = users.get(note.created_by)
            if user_id is not None:
                value["created_by"] = user_id

        values.append(value)

    db_notes = await create_objects_without_duplicates(
        session,
        models.Note,
        values,
        key=lambda x: x["uuid"],
        key_column=models.Note.uuid,
    )
    return {note.uuid: note.id for note in db_notes}
