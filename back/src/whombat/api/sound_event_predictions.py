"""Python API for interacting with Predictions."""

from pathlib import Path
from uuid import UUID

from soundevent import data
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.api.sound_events import sound_events
from whombat.api.tags import tags

__all__ = [
    "SoundEventPredictionAPI",
    "sound_event_predictions",
]


class SoundEventPredictionAPI(
    BaseAPI[
        UUID,
        models.SoundEventPrediction,
        schemas.SoundEventPrediction,
        schemas.SoundEventPredictionCreate,
        schemas.SoundEventPredictionUpdate,
    ]
):
    _model = models.SoundEventPrediction
    _schema = schemas.SoundEventPrediction

    async def create(
        self,
        session: AsyncSession,
        sound_event: schemas.SoundEvent,
        clip_prediction: schemas.ClipPrediction,
        score: float,
        **kwargs,
    ) -> schemas.SoundEventPrediction:
        """Create a sound event prediction.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        sound_event
            The sound event that was predicted.
        clip_prediction
            The clip prediction that this sound event prediction belongs to.
        score
            The confidence score of the prediction.
        **kwargs
            Additional keyword arguments to use when creating the sound event
            (e.g. `uuid` or `created_on`.)

        Returns
        -------
        schemas.SoundEventPrediction
            Created sound event prediction.
        """
        return await self.create_from_data(
            session,
            sound_event_id=sound_event.id,
            clip_prediction_id=clip_prediction.id,
            score=score,
            **kwargs,
        )

    async def add_tag(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventPrediction,
        tag: schemas.Tag,
        score: float,
    ) -> schemas.SoundEventPrediction:
        """Add a tag to a sound event prediction.

        Parameters
        ----------
        session
            SQLAlchemy database session.
        obj
            Sound event prediction to add the tag to.
        tag
            Tag to add.
        score
            Confidence score of the tag.

        Returns
        -------
        sound_event_prediction_tag : schemas.SoundEventPredictionTag
            Updated sound event prediction.
        """
        for t in obj.tags:
            if (t.tag.key, t.tag.value) == (tag.key, tag.value):
                raise exceptions.DuplicateObjectError(
                    f"Tag {tag} already exists in sound event "
                    f"prediction {obj.id}"
                )

        db_tag = await common.create_object(
            session,
            models.SoundEventPredictionTag,
            sound_event_prediction_id=obj.id,
            tag_id=tag.id,
            score=score,
        )

        obj = obj.model_copy(
            update=dict(
                tags=[
                    *obj.tags,
                    schemas.SoundEventPredictionTag.model_validate(db_tag),
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_tag(
        self,
        session: AsyncSession,
        obj: schemas.SoundEventPrediction,
        tag: schemas.Tag,
    ) -> schemas.SoundEventPrediction:
        """Remove a tag from a sound event prediction.

        Parameters
        ----------
        session
            SQLAlchemy database session.
        obj
            Sound event prediction to remove the tag from.
        tag
            Tag to remove.

        Returns
        -------
        sound_event_prediction : schemas.SoundEventPrediction
            The updated sound event prediction.
        """
        for t in obj.tags:
            if (t.tag.key, t.tag.value) == (tag.key, tag.value):
                break
        else:
            raise exceptions.NotFoundError(
                f"Tag {tag} does not exist in sound event "
                f"prediction {obj.id}"
            )

        await common.delete_object(
            session,
            models.SoundEventPredictionTag,
            and_(
                models.SoundEventPredictionTag.sound_event_prediction_id
                == obj.id,
                models.SoundEventPredictionTag.tag_id == tag.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                tags=[
                    t
                    for t in obj.tags
                    if t.tag.key != tag.key or t.tag.value != tag.value
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.SoundEventPrediction,
        clip_prediction: schemas.ClipPrediction,
    ) -> schemas.SoundEventPrediction:
        """Get the Whombat representation of a sound event prediction.

        Parameters
        ----------
        session
            SQLAlchemy database session.
        data
            A sound event prediction in soundevent format.
        clip_prediction
            The clip prediction that the sound event prediction belongs to.

        Returns
        -------
        sound_event_prediction : schemas.SoundEventPrediction
            The sound event prediction in Whombat format.
        """
        try:
            prediction = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            prediction = await self._create_from_soundevent(
                session,
                data,
                clip_prediction,
            )

        existing_tags = {(t.tag.key, t.tag.value) for t in prediction.tags}
        for predicted_tag in data.tags:
            if (
                predicted_tag.tag.key,
                predicted_tag.tag.value,
            ) in existing_tags:
                continue
            tag = await tags.from_soundevent(session, predicted_tag.tag)
            prediction = await self.add_tag(
                session,
                prediction,
                tag,
                predicted_tag.score,
            )

        return prediction

    async def to_soundevent(
        self,
        session: AsyncSession,
        sound_event_prediction: schemas.SoundEventPrediction,
        audio_dir: Path | None = None,
        recording: schemas.Recording | None = None,
    ) -> data.SoundEventPrediction:
        """Get the the sound event prediction in `soundevent` format.

        Parameters
        ----------
        sound_event_prediction
            The sound event prediction to convert to soundevent format.

        Returns
        -------
        sound_event : data.SoundEventPrediction
            The sound event prediction in soundevent format.
        """
        sound_event = await sound_events.to_soundevent(
            session,
            sound_event_prediction.sound_event,
            audio_dir=audio_dir,
            recording=recording,
        )

        return data.SoundEventPrediction(
            uuid=sound_event_prediction.uuid,
            sound_event=sound_event,
            score=sound_event_prediction.score,
            tags=[
                data.PredictedTag(
                    tag=tags.to_soundevent(tag.tag),
                    score=tag.score,
                )
                for tag in sound_event_prediction.tags
            ],
        )

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.SoundEventPrediction,
        clip_prediction: schemas.ClipPrediction,
    ) -> schemas.SoundEventPrediction:
        """Create a new Whombat sound event prediction from a sound event
        prediction in soundevent format.

        Parameters
        ----------
        session
            SQLAlchemy database session.
        data
            A sound event prediction in soundevent format.
        clip_prediction
            The clip prediction that the sound event prediction belongs to.

        Returns
        -------
        sound_event_prediction : schemas.SoundEventPrediction
            The created sound event prediction.
        """
        db_clip_prediction = await common.get_object(
            session,
            models.ClipPrediction,
            models.ClipPrediction.id == clip_prediction.id,
        )
        clip_prediction = schemas.ClipPrediction.model_validate(
            db_clip_prediction
        )

        sound_event = await sound_events.from_soundevent(
            session,
            data.sound_event,
            recording=clip_prediction.clip.recording,
        )

        return await self.create(
            session,
            clip_prediction=clip_prediction,
            sound_event=sound_event,
            score=data.score,
            uuid=data.uuid,
        )


sound_event_predictions = SoundEventPredictionAPI()
