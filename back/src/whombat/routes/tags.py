"""REST API routes for tags."""

from typing import Annotated

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.clip_annotation_tags import ClipAnnotationTagFilter
from whombat.filters.recording_tags import RecordingTagFilter
from whombat.filters.sound_event_annotation_tags import (
    SoundEventAnnotationTagFilter,
)
from whombat.filters.tags import TagFilter
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

tags_router = APIRouter()


@tags_router.get("/", response_model=schemas.Page[schemas.Tag])
async def get_tags(
    session: Session,
    filter: Annotated[TagFilter, Depends(TagFilter)],  # type: ignore
    limit: Limit = 100,
    offset: Offset = 0,
    sort_by: str | None = "value",
):
    """Get all tags."""
    tags, total = await api.tags.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tags,
        total=total,
        limit=limit,
        offset=offset,
    )


@tags_router.get(
    "/recording_tags/", response_model=schemas.Page[schemas.RecordingTag]
)
async def get_recording_tags(
    session: Session,
    filter: Annotated[RecordingTagFilter, Depends(RecordingTagFilter)],  # type: ignore
    limit: Limit = 100,
    offset: Offset = 0,
    sort_by: str | None = "recording_id",
):
    """Get all recording tags."""
    tags, total = await api.tags.get_recording_tags(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tags,
        total=total,
        limit=limit,
        offset=offset,
    )


@tags_router.get(
    "/clip_annotation_tags/",
    response_model=schemas.Page[schemas.ClipAnnotationTag],
)
async def get_clip_annotation_tags(
    session: Session,
    filter: Annotated[
        ClipAnnotationTagFilter,  # type: ignore
        Depends(ClipAnnotationTagFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_on",
) -> schemas.Page[schemas.ClipAnnotationTag]:
    """Get a page of annotation tags."""
    (
        tags,
        total,
    ) = await api.tags.get_clip_annotation_tags(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tags,
        total=total,
        limit=limit,
        offset=offset,
    )


@tags_router.get(
    "/sound_event_annotation_tags/",
    response_model=schemas.Page[schemas.SoundEventAnnotationTag],
)
async def get_sound_event_annotation_tags(
    session: Session,
    filter: Annotated[
        SoundEventAnnotationTagFilter,  # type: ignore
        Depends(SoundEventAnnotationTagFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-created_on",
) -> schemas.Page[schemas.SoundEventAnnotationTag]:
    """Get a page of annotation tags."""
    (
        tags,
        total,
    ) = await api.tags.get_sound_event_annotation_tags(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tags,
        total=total,
        limit=limit,
        offset=offset,
    )


@tags_router.post("/", response_model=schemas.Tag)
async def create_tag(
    session: Session,
    data: schemas.TagCreate,
):
    """Create a new tag."""
    tag = await api.tags.create(session, key=data.key, value=data.value)
    await session.commit()
    return tag


@tags_router.get(
    "/sound_event_annotation_counts/",
    response_model=schemas.Page[schemas.TagCount],
)
async def sound_event_annotation_counts(
    session: Session,
    filter: Annotated[
        SoundEventAnnotationTagFilter,  # type: ignore
        Depends(SoundEventAnnotationTagFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-counts",
):
    """Get the number of sound event annotations each tag is assigned to."""
    tag_counts, total = await api.tags.count_by_sound_event_annotation(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tag_counts,
        total=total,
        limit=limit,
        offset=offset,
    )


@tags_router.get(
    "/clip_annotation_counts/",
    response_model=schemas.Page[schemas.TagCount],
)
async def clip_annotation_counts(
    session: Session,
    filter: Annotated[
        ClipAnnotationTagFilter,  # type: ignore
        Depends(ClipAnnotationTagFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-counts",
):
    """Get the number of clip annotations each tag is assigned to."""
    tag_counts, total = await api.tags.count_by_clip_annotation(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tag_counts,
        total=total,
        limit=limit,
        offset=offset,
    )


@tags_router.get(
    "/recording_counts/",
    response_model=schemas.Page[schemas.TagCount],
)
async def recording_counts(
    session: Session,
    filter: Annotated[
        RecordingTagFilter,  # type: ignore
        Depends(RecordingTagFilter),
    ],
    limit: Limit = 10,
    offset: Offset = 0,
    sort_by: str = "-counts",
):
    """Get the number of recordings each tag is assigned to."""
    tag_counts, total = await api.tags.count_by_recording(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tag_counts,
        total=total,
        limit=limit,
        offset=offset,
    )
