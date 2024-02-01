"""Python API for sound event annotations."""

from pathlib import Path
from uuid import UUID

from soundevent import data
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.api.notes import notes
from whombat.api.sound_events import sound_events
from whombat.api.tags import tags
from whombat.api.users import users

__all__ = [
    "SoundEventAnnotationAPI",
    "sound_event_annotations",
]


class SoundEventAnnotationAPI(
    BaseAPI[
        UUID,
        models.SoundEventAnnotation,
        schemas.SoundEventAnnotation,
        schemas.SoundEventAnnotationCreate,
        schemas.SoundEventAnnotationUpdate,
    ]
):
    _model = models.SoundEventAnnotation
    _schema = schemas.SoundEventAnnotation

    async def create(
        self,
        session: AsyncSession,
        sound_event: schemas.SoundEvent,
        clip_annotation: schemas.ClipAnnotation,
        created_by: schemas.SimpleUser | None = None,
        **kwargs,
    ) -> schemas.SoundEventAnnotation:
        """Create a sound event annotation.

        Parameters
        ----------
        session
            The database session.
        sound_event
            The sound event to annotate.
        clip_annotation
            The clip annotation to add the annotation to.
        created_by
            The user that created the annotation. Defaults to None.
        **kwargs
            Additional keyword arguments to use when creating the annotation,
            (e.g. `uuid` or `created_on`.)

        Returns
        -------
        schemas.SoundEventAnnotation
            The created sound event annotation.
        """
        return await self.create_from_data(
            session,
            sound_event_id=sound_event.id,
            clip_annotation_id=clip_annotation.id,
            created_by_id=created_by.id if created_by else None,
            **kwargs,
        )

    async def add_tag(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventAnnotation,
        tag: schemas.Tag,
        user: schemas.SimpleUser | None = None,
    ) -> schemas.SoundEventAnnotation:
        """Add a tag to an annotation project."""
        user_id = user.id if user else None
        for t in obj.tags:
            if t.key == tag.key and t.value == tag.value:
                raise exceptions.DuplicateObjectError(
                    f"Tag {tag} already exists in annotation {obj}."
                )

        await common.create_object(
            session,
            models.SoundEventAnnotationTag,
            sound_event_annotation_id=obj.id,
            tag_id=tag.id,
            created_by_id=user_id,
        )

        obj = obj.model_copy(
            update=dict(
                tags=[
                    tag,
                    *obj.tags,
                ],
            )
        )
        self._update_cache(obj)
        return obj

    async def add_note(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventAnnotation,
        note: schemas.Note,
    ) -> schemas.SoundEventAnnotation:
        """Add a note to an annotation project."""
        for n in obj.notes:
            if n.id == note.id:
                raise exceptions.DuplicateObjectError(
                    f"Note {note} already exists in annotation {obj}."
                )

        await common.create_object(
            session,
            models.SoundEventAnnotationNote,
            sound_event_annotation_id=obj.id,
            note_id=note.id,
        )

        obj = obj.model_copy(
            update=dict(
                notes=[
                    note,
                    *obj.notes,
                ],
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_tag(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventAnnotation,
        tag: schemas.Tag,
    ) -> schemas.SoundEventAnnotation:
        """Remove a tag from an annotation project."""
        for t in obj.tags:
            if t.key == tag.key and t.value == tag.value:
                break
        else:
            raise exceptions.NotFoundError(
                f"Tag {tag} does not exist in annotation {obj}."
            )

        await common.delete_object(
            session,
            models.SoundEventAnnotationTag,
            and_(
                models.SoundEventAnnotationTag.sound_event_annotation_id
                == obj.id,
                models.SoundEventAnnotationTag.tag_id == tag.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                tags=[
                    t
                    for t in obj.tags
                    if not (t.key == tag.key and t.value == tag.value)
                ],
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_note(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventAnnotation,
        note: schemas.Note,
    ) -> schemas.SoundEventAnnotation:
        """Remove a note from an annotation project."""
        for n in obj.notes:
            if n.id == note.id:
                break
        else:
            raise exceptions.NotFoundError(
                f"Note {note} does not exist in annotation {obj}."
            )

        await common.delete_object(
            session,
            models.SoundEventAnnotationNote,
            and_(
                models.SoundEventAnnotationNote.sound_event_annotation_id
                == obj.id,
                models.SoundEventAnnotationNote.note_id == note.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                notes=[n for n in obj.notes if n.id != note.id],
            )
        )
        self._update_cache(obj)
        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.SoundEventAnnotation,
        clip_annotation: schemas.ClipAnnotation,
    ) -> schemas.SoundEventAnnotation:
        """Get or create an annotation from a `soundevent` annotation.

        If an annotation with the same UUID already exists, it will be updated
        with any tags or notes that are in the `soundevent` annotation but not
        in current state of the annotation.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        data
            The sound event annotation to create the annotation from.
        clip_annotation
            The clip annotation to add the annotation to.

        Returns
        -------
        schemas.SoundEventAnnotation
            The created annotation.
        """
        try:
            annotation = await self.get(session, data.uuid)
            return await self._update_from_soundevent(
                session,
                annotation,
                data,
            )
        except exceptions.NotFoundError:
            pass

        return await self._create_from_soundevent(
            session,
            data,
            clip_annotation,
        )

    async def to_soundevent(
        self,
        session: AsyncSession,
        annotation: schemas.SoundEventAnnotation,
        audio_dir: Path | None = None,
        recording: schemas.Recording | None = None,
    ) -> data.SoundEventAnnotation:
        """Convert an annotation to a `soundevent` annotation.

        Parameters
        ----------
        annotation : schemas.SoundEventAnnotation
            The annotation to convert.

        Returns
        -------
        data.SoundEventAnnotation
            The `soundevent` annotation.
        """
        return data.SoundEventAnnotation(
            uuid=annotation.uuid,
            created_on=annotation.created_on,
            created_by=(
                users.to_soundevent(annotation.created_by)
                if annotation.created_by
                else None
            ),
            sound_event=await sound_events.to_soundevent(
                session,
                annotation.sound_event,
                audio_dir=audio_dir,
                recording=recording,
            ),
            tags=[tags.to_soundevent(t) for t in annotation.tags],
            notes=[notes.to_soundevent(n) for n in annotation.notes],
        )

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.SoundEventAnnotation,
        clip_annotation: schemas.ClipAnnotation,
    ) -> schemas.SoundEventAnnotation:
        """Create an annotation from a sound event annotation.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        data
            The sound event annotation to create the annotation from.
        clip_annotation
            The clip annotation to add the annotation to.

        Returns
        -------
        schemas.SoundEventAnnotation
            The created annotation.
        """

        user = None
        if data.created_by is not None:
            user = await users.from_soundevent(session, data.created_by)

        sound_event = await sound_events.from_soundevent(
            session,
            data.sound_event,
            clip_annotation.clip.recording,
        )

        return await self.create(
            session,
            clip_annotation=clip_annotation,
            created_by=user,
            sound_event=sound_event,
            uuid=data.uuid,
            created_on=data.created_on,
        )

    async def _update_from_soundevent(
        self,
        session: AsyncSession,
        sound_event_annotation: schemas.SoundEventAnnotation,
        data: data.SoundEventAnnotation,
    ) -> schemas.SoundEventAnnotation:
        """Update an annotation from a sound event annotation.

        This function will add any tags or notes that are in the sound event
        annotation but not in the annotation. It will not remove any tags or
        notes.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        sound_event_annotation
            The annotation to update.
        data
            The sound event annotation to update the annotation from.

        Returns
        -------
        schemas.SoundEventAnnotation
            The updated annotation.

        Notes
        -----
        Since `soundevent` annotation tags do not store the user that created
        them, any tag that is added to the annotation will be attributed to the
        creator of the annotation.
        """
        if not sound_event_annotation.uuid == data.uuid:
            raise ValueError(
                "Annotation UUID does not match SoundEventAnnotation UUID"
            )

        tag_keys = {(t.key, t.value) for t in sound_event_annotation.tags}
        for se_tag in data.tags:
            if (se_tag.key, se_tag.value) in tag_keys:
                continue

            tag = await tags.from_soundevent(session, se_tag)
            sound_event_annotation = await self.add_tag(
                session,
                sound_event_annotation,
                tag,
                user=sound_event_annotation.created_by,
            )

        note_keys = {n.uuid for n in sound_event_annotation.notes}
        for se_note in data.notes:
            if se_note.uuid in note_keys:
                continue

            note = await notes.from_soundevent(session, se_note)
            sound_event_annotation = await self.add_note(
                session,
                sound_event_annotation,
                note,
            )

        return sound_event_annotation


sound_event_annotations = SoundEventAnnotationAPI()
