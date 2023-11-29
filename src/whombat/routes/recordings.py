"""REST API routes for recordings."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import ActiveUser, Session
from whombat.filters.recording_notes import RecordingNoteFilter
from whombat.filters.recording_tags import RecordingTagFilter
from whombat.filters.recordings import RecordingFilter
from whombat.routes.types import Limit, Offset

__all__ = [
    "recording_router",
]

recording_router = APIRouter()


@recording_router.get(
    "/",
    response_model=schemas.Page[schemas.Recording],
)
async def get_recordings(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: RecordingFilter = Depends(RecordingFilter),  # type: ignore
):
    """Get a page of datasets."""
    datasets, total = await api.recordings.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=datasets,
        total=total,
        offset=offset,
        limit=limit,
    )


@recording_router.get(
    "/detail/",
    response_model=schemas.Recording,
)
async def get_recording(
    session: Session,
    recording_id: int,
):
    """Get a recording."""
    return await api.recordings.get_by_id(
        session,
        recording_id,
    )


@recording_router.patch(
    "/detail/",
    response_model=schemas.Recording,
)
async def update_recording(
    session: Session,
    recording_id: int,
    recording: schemas.RecordingUpdate,
):
    """Update a recording."""
    response = await api.recordings.update(
        session,
        recording_id,
        recording,
    )
    await session.commit()
    return response


@recording_router.post(
    "/detail/tags/",
    response_model=schemas.Recording,
)
async def add_recording_tag(
    session: Session,
    recording_id: int,
    tag_id: int,
):
    """Add a tag to a recording."""
    response = await api.recordings.add_tag(
        session,
        recording_id,
        tag_id,
    )
    await session.commit()
    return response


@recording_router.delete(
    "/detail/tags/",
    response_model=schemas.Recording,
)
async def remove_recording_tag(
    session: Session,
    recording_id: int,
    tag_id: int,
):
    """Remove a tag from a recording."""
    response = await api.recordings.remove_tag(
        session,
        recording_id,
        tag_id,
    )
    await session.commit()
    return response


@recording_router.post(
    "/detail/notes/",
    response_model=schemas.Recording,
)
async def add_recording_note(
    session: Session,
    recording_id: int,
    data: schemas.NoteCreate,
    user: ActiveUser,
):
    """Add a note to a recording."""
    note = await api.notes.create(
        session,
        schemas.NotePostCreate(
            created_by_id=user.id,
            **dict(data),
        ),
    )
    response = await api.recordings.add_note(
        session,
        recording_id,
        note.id,
    )
    await session.commit()
    return response


@recording_router.patch(
    "/detail/notes/",
    response_model=schemas.Recording,
)
async def update_recording_note(
    session: Session,
    recording_id: int,
    note_id: int,
    data: schemas.NoteUpdate,
):
    """Update a note on a recording."""
    response = await api.recordings.update_note(
        session,
        recording_id,
        note_id,
        data,
    )
    await session.commit()
    return response


@recording_router.delete(
    "/detail/notes/",
    response_model=schemas.Recording,
)
async def remove_recording_note(
    session: Session,
    recording_id: int,
    note_id: int,
):
    """Remove a note from a recording."""
    response = await api.recordings.remove_note(
        session,
        recording_id,
        note_id,
    )
    await session.commit()
    return response


@recording_router.post(
    "/detail/features/",
    response_model=schemas.Recording,
)
async def add_recording_feature(
    session: Session,
    recording_id: int,
    feature_name_id: int,
    value: float,
):
    """Add a feature to a recording."""
    response = await api.recordings.add_feature(
        session,
        recording_id,
        feature_name_id,
        value,
    )
    await session.commit()
    return response


@recording_router.delete(
    "/detail/features/",
    response_model=schemas.Recording,
)
async def remove_recording_feature(
    session: Session,
    recording_id: int,
    feature_name_id: int,
):
    """Remove a feature from a recording."""
    response = await api.recordings.remove_feature(
        session,
        recording_id,
        feature_name_id,
    )
    await session.commit()
    return response


@recording_router.patch(
    "/detail/features/",
    response_model=schemas.Recording,
)
async def update_recording_feature(
    session: Session,
    recording_id: int,
    feature_name_id: int,
    value: float,
):
    """Update a feature on a recording."""
    response = await api.recordings.update_feature(
        session,
        recording_id,
        feature_name_id,
        value,
    )
    await session.commit()
    return response


@recording_router.get(
    "/notes/",
    response_model=schemas.Page[schemas.RecordingNote],
)
async def get_recording_notes(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: RecordingNoteFilter = Depends(RecordingNoteFilter),  # type: ignore
):
    """Get a page of notes for a recording."""
    notes, total = await api.recordings.get_notes(
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


@recording_router.get(
    "/tags/",
    response_model=schemas.Page[schemas.RecordingTag],
)
async def get_recording_tags(
    session: Session,
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_at",
    filter: RecordingTagFilter = Depends(RecordingTagFilter),  # type: ignore
):
    """Get a page of tags for a recording."""
    tags, total = await api.recordings.get_tags(
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
