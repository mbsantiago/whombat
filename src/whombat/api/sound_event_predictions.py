"""Python API for interacting with Predictions."""

from uuid import UUID

from soundevent import data
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common, tags
from whombat.api.common import BaseAPI
from whombat.api.sound_events import sound_events

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
        for t in obj.predicted_tags:
            if (t.tag.key, t.tag.value) == (tag.key, tag.value):
                raise exceptions.DuplicateObjectError(
                    f"Tag {tag} already exists in sound event "
                    f"prediction {obj.id}"
                )

        db_tag = await common.create_object(
            session,
            models.SoundEventPredictionTag,
            schemas.SoundEventPredictionTagCreate(
                sound_event_prediction_id=obj.id,
                tag_id=tag.id,
                score=score,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                predicted_tags=[
                    *obj.predicted_tags,
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
        for t in obj.predicted_tags:
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
                predicted_tags=[t for t in obj.predicted_tags if t.id != t.id]
            )
        )
        self._update_cache(obj)
        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.SoundEventPrediction,
        clip_prediction_id: int,
    ) -> schemas.SoundEventPrediction:
        """Get the Whombat representation of a sound event prediction.

        Parameters
        ----------
        session
            SQLAlchemy database session.
        data
            A sound event prediction in soundevent format.
        clip_prediction_id
            ID of the clip prediction that the sound event prediction belongs
            to.

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
                clip_prediction_id,
            )

        existing_tags = {
            (t.tag.key, t.tag.value) for t in prediction.predicted_tags
        }
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

    def to_soundevent(
        self,
        sound_event_prediction: schemas.SoundEventPrediction,
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
        sound_event = sound_events.to_soundevent(
            sound_event_prediction.sound_event,
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
                for tag in sound_event_prediction.predicted_tags
            ],
        )

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.SoundEventPrediction,
        clip_prediction_id: int,
    ) -> schemas.SoundEventPrediction:
        """Create a new Whombat sound event prediction from a sound event
        prediction in soundevent format.

        Parameters
        ----------
        session
            SQLAlchemy database session.
        data
            A sound event prediction in soundevent format.
        clip_prediction_id
            ID of the clip prediction that the sound event prediction belongs
            to.

        Returns
        -------
        sound_event_prediction : schemas.SoundEventPrediction
            The created sound event prediction.
        """
        db_clip_prediction = await common.get_object(
            session,
            models.ClipPrediction,
            models.ClipPrediction.id == clip_prediction_id,
        )
        clip_prediction = schemas.ClipPrediction.model_validate(
            db_clip_prediction
        )

        sound_event = await sound_events.from_soundevent(
            session,
            data.sound_event,
            recording=clip_prediction.clip.recording,
        )

        prediction = await self.create(
            session,
            schemas.SoundEventPredictionCreate(
                uuid=data.uuid,
                clip_prediction_id=clip_prediction.id,
                sound_event_id=sound_event.id,
                score=data.score,
            ),
        )

        return prediction


sound_event_predictions = SoundEventPredictionAPI()
