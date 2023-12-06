"""API functions for interacting with audio clips."""

from typing import Sequence
from uuid import UUID

from soundevent import data
from sqlalchemy import and_, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common, features, recordings
from whombat.api.common import BaseAPI

__all__ = [
    "ClipAPI",
    "compute_clip_duration",
    "compute_clip_features",
    "clips",
]


class ClipAPI(
    BaseAPI[
        UUID,
        models.Clip,
        schemas.Clip,
        schemas.ClipCreate,
        schemas.ClipUpdate,
    ]
):
    _model = models.Clip
    _schema = schemas.Clip

    async def add_feature(
        self,
        session: AsyncSession,
        obj: schemas.Clip,
        feature: schemas.Feature,
    ) -> schemas.Clip:
        """Add feature to clip.

        Parameters
        ----------
        session
            Database session.
        obj
            Clip to add feature to.
        feature
            Feature to add to clip.

        Returns
        -------
        schemas.Clip
            Updated clip.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If clip does not exist.
        """
        for f in obj.features:
            if f.feature_name == feature.feature_name:
                raise ValueError(
                    f"Clip {obj.id} already has a feature with feature name "
                    f"{feature.feature_name}."
                )

        await common.create_object(
            session,
            models.ClipFeature,
            schemas.ClipFeatureCreate(
                clip_id=obj.id,
                feature_name_id=feature.feature_name.id,
                value=feature.value,
            ),
        )

        obj = obj.model_copy(update=dict(features=[*obj.features, feature]))
        self._update_cache(obj)
        return obj

    async def update_feature(
        self,
        session: AsyncSession,
        obj: schemas.Clip,
        feature: schemas.Feature,
    ) -> schemas.Clip:
        """Update a feature value for a clip.

        If the clip does not have the feature, it will be added.

        Parameters
        ----------
        session
            Database session.
        obj
            Clip to update feature for.
        feature
            Feature to update.

        Returns
        -------
        schemas.Clip
            The updated clip.

        Raises
        ------
        exceptions.NotFoundError
            Raised if clip does not exist in the database.
        """
        for f in obj.features:
            if f.feature_name == feature.feature_name:
                break
        else:
            raise ValueError(
                f"Clip {obj} does not have a feature with feature "
                f"name {feature.feature_name}."
            )

        await common.update_object(
            session,
            models.ClipFeature,
            and_(
                models.ClipFeature.clip_id == obj.id,
                models.ClipFeature.feature_name_id == feature.feature_name.id,
            ),
            value=feature.value,
        )

        obj = obj.model_copy(
            update=dict(
                features=[
                    f if f.feature_name != feature.feature_name else feature
                    for f in obj.features
                ]
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_feature(
        self,
        session: AsyncSession,
        obj: schemas.Clip,
        feature: schemas.Feature,
    ) -> schemas.Clip:
        """Remove feature from clip.

        Parameters
        ----------
        session
            Database session.
        obj
            Clip to remove feature from.
        feature
            Feature to remove from clip.

        Returns
        -------
        schemas.Clip
            The updated clip.

        Raises
        ------
        exceptions.NotFoundError
            Raised if clip does not exist in the database.
        """
        for f in obj.features:
            if f.feature_name == feature.feature_name:
                break
        else:
            raise ValueError(
                f"Clip {obj} does not have a feature with feature "
                f"name {feature.feature_name}."
            )

        await common.delete_object(
            session,
            models.ClipFeature,
            and_(
                models.ClipFeature.clip_id == obj.id,
                models.ClipFeature.feature_name_id == feature.feature_name.id,
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

    async def _create_clip_features(
        self,
        session: AsyncSession,
        clips: Sequence[models.Clip],
    ) -> None:
        """Create features for clips.

        Parameters
        ----------
        session
            Database session.
        clips
            List of clips to create features for.
        """
        clip_features = [
            (clip.id, name, value)
            for clip in clips
            for name, value in compute_clip_features(clip).items()
        ]

        # Get feature names
        names = {name for _, name, _ in clip_features}

        feature_names: dict[str, schemas.FeatureName] = {
            name: await features.get_or_create(
                session, data=schemas.FeatureNameCreate(name=name)
            )
            for name in names
        }

        data = [
            schemas.ClipFeatureCreate(
                clip_id=clip_id,
                feature_name_id=feature_names[name].id,
                value=value,
            )
            for clip_id, name, value in clip_features
        ]

        await common.create_objects(session, models.ClipFeature, data)

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.Clip,
    ) -> schemas.Clip:
        """Create a clip from a soundevent Clip object.

        Parameters
        ----------
        session
            The database session to use.
        data
            The soundevent Clip object.

        Returns
        -------
        clip : schemas.Clip
            The created clip.
        """
        try:
            return await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            pass

        recording = await recordings.from_soundevent(session, data.recording)

        return await self.create(
            session,
            schemas.ClipCreate(
                uuid=data.uuid,
                recording_id=recording.id,
                start_time=data.start_time,
                end_time=data.end_time,
            ),
        )

    def to_soundevent(
        self,
        obj: schemas.Clip,
    ) -> data.Clip:
        """Create a soundevent Clip object from a clip.

        Parameters
        ----------
        obj
            The clip.

        Returns
        -------
        clip : data.Clip
            The soundevent Clip object.
        """
        return data.Clip(
            uuid=obj.uuid,
            recording=recordings.to_soundevent(obj.recording),
            start_time=obj.start_time,
            end_time=obj.end_time,
        )

    @classmethod
    def _key_fn(
        cls, obj: schemas.Clip | models.Clip
    ) -> tuple[int, float, float]:
        return obj.recording_id, obj.start_time, obj.end_time

    @classmethod
    def _get_key_columns(cls):
        return tuple_(
            cls._model.recording_id,
            cls._model.start_time,
            cls._model.end_time,
        )


DURATION = "duration"
"""Name of duration feature."""


def compute_clip_duration(clip: schemas.Clip | models.Clip) -> float:
    """Compute duration of clip.

    Parameters
    ----------
    clip
        Clip to compute duration for.

    Returns
    -------
    float
        Duration of clip.
    """
    return clip.end_time - clip.start_time


CLIP_FEATURES = {
    DURATION: compute_clip_duration,
}


def compute_clip_features(
    clip: schemas.Clip | models.Clip,
) -> dict[str, float]:
    """Compute features for clip.

    Parameters
    ----------
    clip
        Clip to compute features for.

    Returns
    -------
    dict[str, float]
        Dictionary of feature names and values.
    """
    return {name: func(clip) for name, func in CLIP_FEATURES.items()}


clips = ClipAPI()
