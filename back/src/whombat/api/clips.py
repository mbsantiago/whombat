"""API functions for interacting with audio clips."""

from pathlib import Path
from typing import Sequence
from uuid import UUID

from soundevent import data
from sqlalchemy import and_, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.api.features import features
from whombat.api.recordings import recordings

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

    async def create(
        self,
        session: AsyncSession,
        recording: schemas.Recording,
        start_time: float,
        end_time: float,
        **kwargs,
    ) -> schemas.Clip:
        """Create a clip.

        Parameters
        ----------
        session
            The database session to use.
        recording
            The recording the clip belongs to.
        start_time
            The start time of the clip.
        end_time
            The end time of the clip.
        **kwargs
            Additional keyword arguments for creating the clip.

        Returns
        -------
        clip : schemas.Clip
            The created clip.
        """
        clip = await self.create_from_data(
            session,
            schemas.ClipCreate(
                start_time=start_time,
                end_time=end_time,
            ),
            recording_id=recording.id,
            **kwargs,
        )

        features = await self._create_clip_features(session, [clip])
        clip = clip.model_copy(update=dict(features=features[0]))
        self._update_cache(clip)
        return clip

    async def create_many_without_duplicates(
        self,
        session: AsyncSession,
        data: Sequence[dict],
        return_all: bool = False,
    ) -> Sequence[schemas.Clip]:
        """Create clips without duplicates.

        Parameters
        ----------
        session
            Database session.
        data
            List of clips to create.
        return_all
            Whether to return all clips or only the created ones.
            Since some clips may already exist, this may not be the same.

        Returns
        -------
        list[schemas.Clip]
            Created clips.
        """
        clips = await super().create_many_without_duplicates(
            session,
            data,
            return_all=return_all,
        )

        if not clips:
            return clips

        clip_features = await self._create_clip_features(session, clips)
        return [
            clip.model_copy(update=dict(features=features))
            for clip, features in zip(clips, clip_features)
        ]

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
            if f.name == feature.name:
                raise exceptions.DuplicateObjectError(
                    f"Clip {obj.id} already has a feature with feature name "
                    f"{feature.name}."
                )

        feature_name = await features.get_or_create(session, name=feature.name)

        await common.create_object(
            session,
            models.ClipFeature,
            clip_id=obj.id,
            feature_name_id=feature_name.id,
            value=feature.value,
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
            if f.name == feature.name:
                break
        else:
            raise ValueError(
                f"Clip {obj} does not have a feature with feature "
                f"name {feature.name}."
            )

        feature_name = await features.get(session, feature.name)

        await common.update_object(
            session,
            models.ClipFeature,
            and_(
                models.ClipFeature.clip_id == obj.id,
                models.ClipFeature.feature_name_id == feature_name.id,
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
            if f.name == feature.name:
                break
        else:
            raise ValueError(
                f"Clip {obj} does not have a feature with feature "
                f"name {feature.name}."
            )

        feature_name = await features.get(session, feature.name)

        await common.delete_object(
            session,
            models.ClipFeature,
            and_(
                models.ClipFeature.clip_id == obj.id,
                models.ClipFeature.feature_name_id == feature_name.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                features=[f for f in obj.features if f.name != feature.name]
            )
        )
        self._update_cache(obj)
        return obj

    async def _create_clip_features(
        self,
        session: AsyncSession,
        clips: Sequence[schemas.Clip],
    ) -> Sequence[list[schemas.Feature]]:
        """Create features for clips.

        Parameters
        ----------
        session
            Database session.
        clips
            List of clips to create features for.

        Returns
        -------
        list[list[schemas.Feature]]
            List of features created for each clip.
        """

        clip_features = [
            [
                schemas.Feature(name=name, value=value)
                for name, value in compute_clip_features(clip).items()
            ]
            for clip in clips
        ]

        create_values = [
            (clip.id, feature.name, feature.value)
            for clip, features in zip(clips, clip_features)
            for feature in features
        ]

        # Get feature names
        names = {name for _, name, _ in create_values}

        feature_names: dict[str, schemas.FeatureName] = {
            name: await features.get_or_create(session, name=name)
            for name in names
        }

        data = [
            dict(
                clip_id=clip_id,
                feature_name_id=feature_names[name].id,
                value=value,
            )
            for clip_id, name, value in create_values
        ]

        await common.create_objects_without_duplicates(
            session,
            models.ClipFeature,
            data,
            key=lambda obj: (obj["clip_id"], obj["feature_name_id"]),
            key_column=tuple_(
                models.ClipFeature.clip_id,
                models.ClipFeature.feature_name_id,
            ),
            return_all=True,
        )
        return clip_features

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
            recording=recording,
            start_time=data.start_time,
            end_time=data.end_time,
            uuid=data.uuid,
        )

    def to_soundevent(
        self, obj: schemas.Clip, audio_dir: Path | None = None
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
            recording=recordings.to_soundevent(
                obj.recording,
                audio_dir=audio_dir,
            ),
            start_time=obj.start_time,
            end_time=obj.end_time,
        )

    def _key_fn(self, obj: dict):
        return (
            obj.get("recording_id"),
            obj.get("start_time"),
            obj.get("end_time"),
        )

    def _get_key_column(self):
        return tuple_(
            self._model.recording_id,
            self._model.start_time,
            self._model.end_time,
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
