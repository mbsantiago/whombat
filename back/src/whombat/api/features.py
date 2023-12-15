"""API functions to interact with feature names."""

from typing import Any, Sequence

from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api.common import BaseAPI

__all__ = [
    "FeatureNameAPI",
    "features",
    "find_feature",
    "find_feature_value",
]


class FeatureNameAPI(
    BaseAPI[
        str,
        models.FeatureName,
        schemas.FeatureName,
        schemas.FeatureNameCreate,
        schemas.FeatureNameUpdate,
    ]
):
    """API for interacting with feature names."""

    _model = models.FeatureName
    _schema = schemas.FeatureName

    async def create(
        self,
        session: AsyncSession,
        name: str,
    ) -> schemas.FeatureName:
        """Create a feature name.

        Parameters
        ----------
        session
            The database session.
        name
            The name of the feature.

        Returns
        -------
        schemas.FeatureName
            The feature name.
        """
        return await self.create_from_data(
            session=session,
            data=schemas.FeatureNameCreate(name=name),
        )

    async def get_or_create(
        self,
        session: AsyncSession,
        name: str,
    ) -> schemas.FeatureName:
        """Get or create a feature name.

        Parameters
        ----------
        session
            The database session.
        name
            The name of the feature.

        Returns
        -------
        schemas.FeatureName
            The feature name.
        """
        try:
            return await self.get(session=session, pk=name)
        except exceptions.NotFoundError:
            obj = await self.create(
                session=session,
                name=name,
            )
            self._update_cache(obj)
            return obj

    async def get_feature(
        self,
        session: AsyncSession,
        name: str,
        value: float,
    ) -> schemas.Feature:
        """Get a feature object.

        Will create the feature name if it does not exist.

        Parameters
        ----------
        session
            The database session.
        name
            The name of the feature.
        value
            The value of the feature.

        Returns
        -------
        schemas.FeatureName
            The feature name.
        """
        feature_name = await self.get_or_create(
            session=session,
            name=name,
        )
        return schemas.Feature(
            name=feature_name.name,
            value=value,
        )

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.Feature,
    ) -> schemas.Feature:
        """Create a feature from a soundevent Feature object.

        Parameters
        ----------
        session
            The database session.
        data
            The soundevent feature object.

        Returns
        -------
        schemas.FeatureCreate
            The feature.
        """
        feature_name = await self.get_or_create(
            session=session,
            name=data.name,
        )
        return schemas.Feature(
            name=feature_name.name,
            value=data.value,
        )

    def to_soundevent(
        self,
        feature: schemas.Feature,
    ) -> data.Feature:
        """Create a soundevent Feature object from a feature.

        Parameters
        ----------
        feature
            The feature.

        Returns
        -------
        data.Feature
            The soundevent feature object.
        """
        return data.Feature(
            name=feature.name,
            value=feature.value,
        )

    def _get_pk_from_obj(self, obj: schemas.FeatureName) -> str:
        return obj.name

    def _get_pk_condition(self, pk: str) -> Any:
        return models.FeatureName.name == pk


def find_feature(
    features: Sequence[schemas.Feature],
    feature_name: str,
    default: Any = None,
) -> schemas.Feature | None:
    """Find a feature from a list of features by its name.

    Helper function for finding a feature by name. Returns the first feature
    with the given name, or a default value if no feature is found.

    Parameters
    ----------
    features
        The features to search.
    feature_name
        The name of the feature to find.
    default
        The default value to return if the feature is not found.

    Returns
    -------
    feature : schemas.Feature | None
        The feature, or the default value if the feature was not found.
    """
    return next((f for f in features if f.name == feature_name), default)


def find_feature_value(
    features: Sequence[schemas.Feature],
    feature_name: str,
    default: Any = None,
) -> float | None:
    """Find a the value of a feature from a list of features by its name.

    Parameters
    ----------
    features
        The features to search.
    feature_name
        The name of the feature to find.
    default
        The default value to return if the feature is not found.

    Returns
    -------
    value : float | None
        The feature value, or the default value if the feature was not found.
    """
    feature = find_feature(features, feature_name)
    if feature is None:
        return default
    return feature.value


features = FeatureNameAPI()
