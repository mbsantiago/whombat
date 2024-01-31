"""API functions to interact with sound events."""

from pathlib import Path
from typing import Sequence
from uuid import UUID

from soundevent import data
from soundevent.geometry import compute_geometric_features
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.api.features import features
from whombat.api.recordings import recordings

__all__ = [
    "SoundEventAPI",
    "sound_events",
]


class SoundEventAPI(
    BaseAPI[
        UUID,
        models.SoundEvent,
        schemas.SoundEvent,
        schemas.SoundEventCreate,
        schemas.SoundEventUpdate,
    ]
):
    _model = models.SoundEvent
    _schema = schemas.SoundEvent

    async def create(
        self,
        session: AsyncSession,
        recording: schemas.Recording,
        geometry: data.Geometry,
        **kwargs,
    ) -> schemas.SoundEvent:
        """Create a sound event.

        Parameters
        ----------
        session
            The database session.
        recording
            The recording the sound event is from.
        geometry
            The geometry representing the ROI of the sound event.
        **kwargs
            Additional keyword arguments to use when creating the sound event
            (e.g. `uuid` or `created_on`.)

        Returns
        -------
        schemas.SoundEvent
            The created sound event.
        """
        sound_event = await self._create(
            session,
            geometry=geometry,
            geometry_type=geometry.type,
            recording_id=recording.id,
            **kwargs,
        )
        await self.create_geometric_features(session, [sound_event])
        await session.refresh(sound_event)
        return self._schema.model_validate(sound_event)

    async def update(
        self,
        session: AsyncSession,
        obj: schemas.SoundEvent,
        data: schemas.SoundEventUpdate,
    ) -> schemas.SoundEvent:
        """Update a sound event.

        Parameters
        ----------
        session
            The database session.
        obj
            The sound event to update.
        data
            The data to update the sound event with.

        Returns
        -------
        schemas.SoundEvent
            The updated sound event.

        Raises
        ------
        exceptions.NotFoundError
            If the sound event does not exist in the database.
        """
        obj = await super().update(session, obj, data)
        return await self.update_geometric_features(session, obj)

    async def add_feature(
        self,
        session: AsyncSession,
        obj: schemas.SoundEvent,
        feature: schemas.Feature,
    ) -> schemas.SoundEvent:
        """Add features to a sound event.

        Parameters
        ----------
        session
            The database session.
        obj
            The sound event to add features to.
        feature
            The feature to add to the sound event.

        Returns
        -------
        schemas.SoundEvent
            The updated sound event.

        Raises
        ------
        exceptions.NotFoundError
            If the sound event does not exist in the database.
        """
        for f in obj.features:
            if f.name == feature.name:
                raise ValueError(
                    f"Sound event already has feature {feature.name}."
                )

        feature_name = await features.get_or_create(session, name=feature.name)

        await common.create_object(
            session,
            models.SoundEventFeature,
            value=feature.value,
            sound_event_id=obj.id,
            feature_name_id=feature_name.id,
        )

        obj = obj.model_copy(
            update=dict(
                features=[
                    *obj.features,
                    feature,
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def update_feature(
        self,
        session: AsyncSession,
        obj: schemas.SoundEvent,
        feature: schemas.Feature,
    ) -> schemas.SoundEvent:
        """Update features of a sound event.

        Parameters
        ----------
        session
            The database session.
        obj
            The sound event to update features for.
        feature
            The feature to update.

        Returns
        -------
        schemas.SoundEvent
            The updated sound event.

        Raises
        ------
        exceptions.NotFoundError
            If the sound event does not exist in the database.
        """
        for f in obj.features:
            if f.name == feature.name:
                break
        else:
            raise ValueError(
                f"Sound event does not have feature {feature.name}."
            )

        feature_name = await features.get(session, feature.name)

        await common.update_object(
            session,
            models.SoundEventFeature,
            condition=and_(
                models.SoundEventFeature.sound_event_id == obj.id,
                models.SoundEventFeature.feature_name_id == feature_name.id,
            ),
            value=feature.value,
        )

        obj = obj.model_copy(
            update=dict(
                features=[
                    f if f.name != feature.name else feature
                    for f in obj.features
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_feature(
        self,
        session: AsyncSession,
        obj: schemas.SoundEvent,
        feature: schemas.Feature,
    ) -> schemas.SoundEvent:
        """Remove features from a sound event.

        Parameters
        ----------
        session
            The database session.
        obj
            The sound event to remove features from.
        feature
            The feature to remove from the sound event.

        Returns
        -------
        schemas.SoundEvent
            The updated sound event.

        Raises
        ------
        exceptions.NotFoundError
            If the sound event does not exist in the database.
        """
        for f in obj.features:
            if f.name == feature.name:
                break
        else:
            raise ValueError(
                f"Sound event does not have feature {feature.name}."
            )

        feature_name = await features.get(session, feature.name)

        await common.delete_object(
            session,
            models.SoundEventFeature,
            and_(
                models.SoundEventFeature.sound_event_id == obj.id,
                models.SoundEventFeature.feature_name_id == feature_name.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                features=[f for f in obj.features if f.name != feature.name]
            )
        )
        self._update_cache(obj)
        return obj

    async def create_geometric_features(
        self,
        session: AsyncSession,
        sound_events: Sequence[models.SoundEvent],
    ) -> None:
        """Create sound event features.

        Parameters
        ----------
        session
            The database session.
        sound_events
            The sound events.
        """
        all_features = []
        for sound_event in sound_events:
            feats = compute_geometric_features(sound_event.geometry)
            for feature in feats:
                all_features.append(
                    (sound_event.id, feature.name, feature.value)
                )

        feature_names = {f[1] for f in all_features}
        feature_mapping = {
            name: await features.get_or_create(session, name=name)
            for name in feature_names
        }

        data = [
            dict(
                sound_event_id=sound_event_id,
                feature_name_id=feature_mapping[feature_name].id,
                value=value,
            )
            for sound_event_id, feature_name, value in all_features
        ]

        await common.create_objects(
            session,
            models.SoundEventFeature,
            data=data,
        )

    async def update_geometric_features(
        self,
        session: AsyncSession,
        sound_event: schemas.SoundEvent,
    ) -> schemas.SoundEvent:
        """Update the geometric features of a sound event.

        Parameters
        ----------
        sound_event
            The sound event to update the geometric features for.

        Returns
        -------
        schemas.SoundEvent
            The updated sound event.
        """
        geom_features = compute_geometric_features(sound_event.geometry)
        for feature in geom_features:
            try:
                sound_event = await self.update_feature(
                    session,
                    sound_event,
                    schemas.Feature(name=feature.name, value=feature.value),
                )
            except ValueError:
                sound_event = await self.add_feature(
                    session,
                    sound_event,
                    schemas.Feature(name=feature.name, value=feature.value),
                )

        feature_mapping = {f.name: f for f in geom_features}
        sound_event = sound_event.model_copy(
            update=dict(
                features=[
                    (
                        f
                        if f.name not in feature_mapping
                        else feature_mapping[f.name]
                    )
                    for f in sound_event.features
                ]
            )
        )
        self._update_cache(sound_event)
        return sound_event

    async def get_recording(
        self,
        session: AsyncSession,
        sound_event: schemas.SoundEvent,
    ) -> schemas.Recording:
        stmt = (
            select(models.Recording)
            .join(
                models.SoundEvent,
                models.SoundEvent.recording_id == models.Recording.id,
            )
            .filter(models.SoundEvent.id == sound_event.id)
        )
        result = await session.execute(stmt)
        db_recording = result.unique().scalar_one()
        if db_recording is None:
            raise exceptions.NotFoundError(
                f"Recording for sound event {sound_event.uuid} not found."
            )
        return schemas.Recording.model_validate(db_recording)

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.SoundEvent,
        recording: schemas.Recording,
    ) -> schemas.SoundEvent:
        """Create a sound event from a soundevent SoundEvent object.

        Parameters
        ----------
        session
            The database session.
        data
            The soundevent sound event object.
        recording
            The recording the sound event is from.

        Returns
        -------
        schemas.SoundEvent
            The sound event.
        """
        try:
            return await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            pass

        if data.geometry is None:
            raise ValueError("The sound event does not have a geometry.")

        sound_event = await self.create(
            session,
            recording=recording,
            geometry=data.geometry,
            uuid=data.uuid,
        )

        for feature in data.features:
            feat = await features.from_soundevent(session, feature)
            sound_event = await self.add_feature(session, sound_event, feat)

        return sound_event

    async def to_soundevent(
        self,
        session: AsyncSession,
        sound_event: schemas.SoundEvent,
        audio_dir: Path | None = None,
        recording: schemas.Recording | None = None,
    ) -> data.SoundEvent:
        """Create a soundevent SoundEvent object from a sound event.

        Parameters
        ----------
        sound_event
            The sound event.

        Returns
        -------
        data.SoundEvent
            The soundevent sound event object.
        """
        if recording is None:
            recording = await self.get_recording(session, sound_event)
        return data.SoundEvent(
            uuid=sound_event.uuid,
            geometry=sound_event.geometry,
            recording=recordings.to_soundevent(recording, audio_dir=audio_dir),
            features=[features.to_soundevent(f) for f in sound_event.features],
        )

    def _get_pk_column(self):
        return self._model.uuid


sound_events = SoundEventAPI()
