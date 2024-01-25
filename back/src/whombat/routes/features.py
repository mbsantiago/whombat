"""REST API routes for features."""

from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.filters.feature_names import FeatureNameFilter
from whombat.routes.dependencies import Session
from whombat.routes.types import Limit, Offset

__all__ = [
    "features_router",
]


features_router = APIRouter()


@features_router.get("/", response_model=schemas.Page[str])
async def get_features_names(
    session: Session,
    limit: Limit = 100,
    offset: Offset = 0,
    filter: FeatureNameFilter = Depends(FeatureNameFilter),  # type: ignore
) -> schemas.Page[str]:
    """Get list of features names."""
    feature_names, total = await api.features.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
    )
    return schemas.Page(
        items=[feature_name.name for feature_name in feature_names],
        total=total,
        offset=offset,
        limit=limit,
    )
