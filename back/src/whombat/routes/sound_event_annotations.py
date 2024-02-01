"""REST API routes for sound_event_annotations."""

from uuid import UUID

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.api.scatterplots.sound_event_annotations import (
    ScatterPlotData,
    get_scatterplot_data,
)
from whombat.filters.sound_event_annotations import SoundEventAnnotationFilter
from whombat.routes.dependencies import Session, get_current_user_dependency
from whombat.routes.dependencies.settings import WhombatSettings
from whombat.routes.types import Limit, Offset

__all__ = [
    "get_sound_event_annotations_router",
]


def get_sound_event_annotations_router(settings: WhombatSettings) -> APIRouter:
    """Get the API router for sound_event_annotations."""

    active_user = get_current_user_dependency(settings)

    sound_event_annotations_router = APIRouter()

    @sound_event_annotations_router.post(
        "/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def create_annotation(
        session: Session,
        clip_annotation_uuid: UUID,
        data: schemas.SoundEventAnnotationCreate,
        user: schemas.SimpleUser = Depends(active_user),
    ):
        """Create annotation."""

        clip_annotation = await api.clip_annotations.get(
            session,
            clip_annotation_uuid,
        )

        # Create the corresponding sound event
        sound_event = await api.sound_events.create(
            session,
            recording=clip_annotation.clip.recording,
            geometry=data.geometry,
        )

        # Create the annotation
        sound_event_annotation = await api.sound_event_annotations.create(
            session,
            sound_event=sound_event,
            clip_annotation=clip_annotation,
            created_by=user,
        )

        for tag in data.tags:
            tag = await api.tags.get(session, (tag.key, tag.value))
            sound_event_annotation = await api.sound_event_annotations.add_tag(
                session,
                sound_event_annotation,
                tag,
                user,
            )

        await session.commit()
        return sound_event_annotation

    @sound_event_annotations_router.get(
        "/detail/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def get_annotation(
        session: Session,
        sound_event_annotation_uuid: UUID,
    ):
        """Get an annotation."""
        return await api.sound_event_annotations.get(
            session,
            sound_event_annotation_uuid,
        )

    @sound_event_annotations_router.get(
        "/",
        response_model=schemas.Page[schemas.SoundEventAnnotation],
    )
    async def get_sound_event_annotations(
        session: Session,
        limit: Limit = 10,
        offset: Offset = 0,
        filter: SoundEventAnnotationFilter = Depends(SoundEventAnnotationFilter),  # type: ignore
        sort_by: str = "-created_on",
    ):
        """Get a page of annotation sound_event_annotations."""
        (
            sound_event_annotations,
            total,
        ) = await api.sound_event_annotations.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[filter],
            sort_by=sort_by,
        )
        return schemas.Page(
            items=sound_event_annotations,
            total=total,
            limit=limit,
            offset=offset,
        )

    @sound_event_annotations_router.patch(
        "/detail/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def update_annotation(
        session: Session,
        sound_event_annotation_uuid: UUID,
        data: schemas.SoundEventUpdate,
    ):
        """Update an annotation."""
        sound_event_annotation = await api.sound_event_annotations.get(
            session,
            sound_event_annotation_uuid,
        )
        sound_event_annotation.sound_event = await api.sound_events.update(
            session,
            sound_event_annotation.sound_event,
            data,
        )
        await session.commit()
        return sound_event_annotation

    @sound_event_annotations_router.delete(
        "/detail/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def delete_annotation(
        session: Session,
        sound_event_annotation_uuid: UUID,
    ):
        """Remove a clip from an annotation project."""
        sound_event_annotation = await api.sound_event_annotations.get(
            session,
            sound_event_annotation_uuid,
        )
        sound_event_annotaiton = await api.sound_event_annotations.delete(
            session,
            sound_event_annotation,
        )
        await session.commit()
        return sound_event_annotaiton

    @sound_event_annotations_router.post(
        "/detail/tags/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def add_annotation_tag(
        session: Session,
        sound_event_annotation_uuid: UUID,
        key: str,
        value: str,
        user: schemas.SimpleUser = Depends(active_user),
    ):
        """Add a tag to an annotation annotation."""
        sound_event_annotation = await api.sound_event_annotations.get(
            session,
            sound_event_annotation_uuid,
        )
        tag = await api.tags.get(session, (key, value))
        sound_event_annotation = await api.sound_event_annotations.add_tag(
            session,
            sound_event_annotation,
            tag,
            user,
        )
        await session.commit()
        return sound_event_annotation

    @sound_event_annotations_router.delete(
        "/detail/tags/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def remove_annotation_tag(
        session: Session,
        sound_event_annotation_uuid: UUID,
        key: str,
        value: str,
    ):
        """Remove a tag from an annotation annotation."""
        sound_event_annotation = await api.sound_event_annotations.get(
            session,
            sound_event_annotation_uuid,
        )
        tag = await api.tags.get(session, (key, value))
        sound_event_annotation = await api.sound_event_annotations.remove_tag(
            session,
            sound_event_annotation,
            tag,
        )
        await session.commit()
        return sound_event_annotation

    @sound_event_annotations_router.post(
        "/detail/notes/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def create_annotation_note(
        session: Session,
        sound_event_annotation_uuid: UUID,
        data: schemas.NoteCreate,
        user: schemas.SimpleUser = Depends(active_user),
    ):
        """Create a note for an annotation annotation."""
        sound_event_annotation = await api.sound_event_annotations.get(
            session,
            sound_event_annotation_uuid,
        )
        note = await api.notes.create(
            session,
            message=data.message,
            is_issue=data.is_issue,
            created_by=user,
        )
        sound_event_annotation = await api.sound_event_annotations.add_note(
            session,
            sound_event_annotation,
            note,
        )
        await session.commit()
        return sound_event_annotation

    @sound_event_annotations_router.delete(
        "/detail/notes/",
        response_model=schemas.SoundEventAnnotation,
    )
    async def delete_annotation_note(
        session: Session,
        sound_event_annotation_uuid: UUID,
        note_uuid: UUID,
    ):
        """Delete a note from an annotation annotation."""
        sound_event_annotation = await api.sound_event_annotations.get(
            session,
            sound_event_annotation_uuid,
        )
        note = await api.notes.get(session, note_uuid)
        sound_event_annotation = await api.sound_event_annotations.remove_note(
            session,
            sound_event_annotation,
            note,
        )
        await session.commit()
        return sound_event_annotation

    @sound_event_annotations_router.get(
        "/scatter_plot/",
        response_model=schemas.Page[ScatterPlotData],
    )
    async def get_scatter_plot_data(
        session: Session,
        limit: Limit = 1000,
        offset: Offset = 0,
        filter: SoundEventAnnotationFilter = Depends(SoundEventAnnotationFilter),  # type: ignore
    ):
        items, count = await get_scatterplot_data(
            session,
            limit=limit,
            offset=offset,
            filters=[filter],
        )

        return schemas.Page(
            items=items,
            total=count,
            limit=limit,
            offset=offset,
        )

    return sound_event_annotations_router
