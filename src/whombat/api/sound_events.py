"""API functions to interact with sound events."""

from typing import Sequence
from uuid import UUID

from soundevent import data
from soundevent.geometry import compute_geometric_features
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.api.features import features

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
        return await self.create_from_data(
            session,
            schemas.SoundEventCreate(
                recording_id=recording.id,
                geometry=geometry,
            ),
            **kwargs,
        )

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
            if f.feature_name == feature.feature_name:
                raise ValueError(
                    f"Sound event already has feature {feature.feature_name}."
                )

        db_feat = await common.create_object(
            session,
            models.SoundEventFeature,
            data=schemas.SoundEventFeatureCreate(
                sound_event_id=obj.id,
                feature_name_id=feature.feature_name.id,
                value=feature.value,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                features=[
                    *obj.features,
                    schemas.Feature.model_validate(db_feat),
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
            if f.feature_name == feature.feature_name:
                break
        else:
            raise ValueError(
                f"Sound event does not have feature {feature.feature_name}."
            )

        db_feat = await common.update_object(
            session,
            models.SoundEventFeature,
            condition=and_(
                models.SoundEventFeature.sound_event_id == obj.id,
                models.SoundEventFeature.feature_name_id
                == feature.feature_name.id,
            ),
            value=feature.value,
        )

        obj = obj.model_copy(
            update=dict(
                features=[
                    *obj.features,
                    schemas.Feature.model_validate(db_feat),
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
            if f.feature_name == feature.feature_name:
                break
        else:
            raise ValueError(
                f"Sound event does not have feature {feature.feature_name}."
            )

        await common.delete_object(
            session,
            models.SoundEventFeature,
            and_(
                models.SoundEventFeature.sound_event_id == obj.id,
                models.SoundEventFeature.feature_name_id
                == feature.feature_name.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                features=[
                    f
                    for f in obj.features
                    if f.feature_name != feature.feature_name
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def _create_sound_event_features(
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
            schemas.SoundEventFeatureCreate(
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

        return await self.create(
            session,
            recording=recording,
            geometry=data.geometry,
            uuid=data.uuid,
        )

    def to_soundevent(
        self,
        sound_event: schemas.SoundEvent,
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
        return data.SoundEvent(
            uuid=sound_event.uuid,
            geometry=sound_event.geometry,
            features=[features.to_soundevent(f) for f in sound_event.features],
        )


sound_events = SoundEventAPI()
