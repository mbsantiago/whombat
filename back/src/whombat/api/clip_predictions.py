"""Python API for managing clip predictions."""

from pathlib import Path
from uuid import UUID

from soundevent import data
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.clips import clips
from whombat.api.common import BaseAPI
from whombat.api.sound_event_predictions import sound_event_predictions
from whombat.api.tags import tags

__all__ = [
    "ClipPredictionAPI",
    "clip_predictions",
]


class ClipPredictionAPI(
    BaseAPI[
        UUID,
        models.ClipPrediction,
        schemas.ClipPrediction,
        schemas.ClipPredictionCreate,
        schemas.ClipPredictionUpdate,
    ]
):
    _model = models.ClipPrediction
    _schema = schemas.ClipPrediction

    async def create(
        self,
        session: AsyncSession,
        clip: schemas.Clip,
        **kwargs,
    ) -> schemas.ClipPrediction:
        """Create a clip prediction.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        clip
            Clip to create the clip prediction for.
        **kwargs
            Additional arguments to pass to the create method (e.g. uuid).

        Returns
        -------
        schemas.ClipPrediction
            Created clip prediction.
        """
        return await self.create_from_data(
            session,
            clip_id=clip.id,
            **kwargs,
        )

    async def add_tag(
        self,
        session: AsyncSession,
        obj: schemas.ClipPrediction,
        tag: schemas.Tag,
        score: float,
    ) -> schemas.ClipPrediction:
        """Add a tag to a clip prediction.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession to use for the database connection.
        obj
            Clip prediction to add the tag to.
        tag
            Tag to add to the clip prediction.
        score
            Score of the tag.

        Returns
        -------
        clip_prediction : schemas.ClipPrediction
            Clip prediction with the added tag.
        """
        for t in obj.tags:
            if (t.tag.key, t.tag.value) == (tag.key, tag.value):
                raise exceptions.DuplicateObjectError(
                    f"Tag {tag} already exists in clip prediction {obj.id}"
                )

        db_tag = await common.create_object(
            session,
            models.ClipPredictionTag,
            clip_prediction_id=obj.id,
            tag_id=tag.id,
            score=score,
        )

        obj = obj.model_copy(
            update=dict(
                tags=[
                    *obj.tags,
                    schemas.PredictedTag.model_validate(db_tag),
                ],
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_tag(
        self,
        session: AsyncSession,
        obj: schemas.ClipPrediction,
        tag: schemas.Tag,
    ) -> schemas.ClipPrediction:
        """Remove a tag from a clip prediction.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession to use for the database connection.
        obj
            Clip prediction to remove the tag from.
        tag
            Tag to remove from the clip prediction.

        Returns
        -------
        clip_prediction : schemas.ClipPrediction
            Clip prediction with the removed tag.
        """
        for t in obj.tags:
            if (t.tag.key, t.tag.value) == (tag.key, tag.value):
                break
        else:
            raise exceptions.NotFoundError(
                f"Tag {tag} does not exist in clip prediction {obj.id}"
            )

        await common.delete_object(
            session,
            models.ClipPredictionTag,
            and_(
                models.ClipPredictionTag.clip_prediction_id == obj.id,
                models.ClipPredictionTag.tag_id == tag.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                tags=[
                    t
                    for t in obj.tags
                    if not (t.tag.key == tag.key and t.tag.value == tag.value)
                ],
            )
        )
        self._update_cache(obj)
        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.ClipPrediction,
    ) -> schemas.ClipPrediction:
        """Create or update a clip prediction from an object in soundevent.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession to use for the database connection.
        data
            Data of the clip prediction to create or update in soundevent
            format.

        Returns
        -------
        clip_prediction : schemas.ClipPrediction
            Created or updated clip prediction.
        """
        try:
            obj = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            obj = await self._create_from_soundevent(session, data)

        obj = await self._update_from_soundevent(session, obj, data)
        self._update_cache(obj)
        return obj

    async def to_soundevent(
        self,
        session: AsyncSession,
        clip_prediction: schemas.ClipPrediction,
        audio_dir: Path | None = None,
    ) -> data.ClipPrediction:
        """Convert a clip prediction to an object in soundevent format.

        Parameters
        ----------
        clip_prediction
            Clip prediction to convert.

        Returns
        -------
        clip_prediction : data.ClipPrediction
            Converted clip prediction.
        """
        predicted_tags = [
            data.PredictedTag(
                tag=tags.to_soundevent(tag.tag),
                score=tag.score,
            )
            for tag in clip_prediction.tags
        ]
        sound_events = [
            await sound_event_predictions.to_soundevent(
                session,
                prediction,
                audio_dir=audio_dir,
                recording=clip_prediction.clip.recording,
            )
            for prediction in clip_prediction.sound_events
        ]
        return data.ClipPrediction(
            uuid=clip_prediction.uuid,
            clip=clips.to_soundevent(clip_prediction.clip),
            tags=predicted_tags,
            sound_events=sound_events,
        )

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.ClipPrediction,
    ) -> schemas.ClipPrediction:
        """Create a new clip prediction from an object in soundevent format.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession to use for the database connection.
        data
            Data of the clip prediction to create in soundevent format.

        Returns
        -------
        clip_prediction : schemas.ClipPrediction
            Created clip prediction.
        """
        clip = await clips.from_soundevent(
            session,
            data.clip,
        )

        return await self.create(
            session,
            clip=clip,
            uuid=data.uuid,
        )

    async def _update_from_soundevent(
        self,
        session: AsyncSession,
        clip_prediction: schemas.ClipPrediction,
        data: data.ClipPrediction,
    ) -> schemas.ClipPrediction:
        """Update a clip prediction from an object in soundevent format.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession to use for the database connection.
        clip_prediction
            Clip prediction to update.
        data
            Data of the clip prediction to update in soundevent format.

        Returns
        -------
        clip_prediction : schemas.ClipPrediction
            Updated clip prediction.
        """
        for sound_event in data.sound_events:
            await sound_event_predictions.from_soundevent(
                session,
                sound_event,
                clip_prediction=clip_prediction,
            )

        for predicted_tag in data.tags:
            tag = await tags.from_soundevent(
                session,
                predicted_tag.tag,
            )
            clip_prediction = await self.add_tag(
                session,
                clip_prediction,
                tag,
                predicted_tag.score,
            )

        return clip_prediction


clip_predictions = ClipPredictionAPI()
