"""Python API to manage predicted tags."""


from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import schemas
from whombat.api import tags

__all__ = [
    "create",
    "from_soundevent",
    "to_soundevent",
]


async def create(
    session: AsyncSession, tag_id: int, score: float
) -> schemas.PredictedTag:
    """Create a new predicted tag.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    tag_id
        ID of the tag to add.
    score
        Confidence score of the tag.

    Returns
    -------
    predicted_tag : schemas.PredictedTag
        Created predicted tag.
    """
    tag = await tags.get_by_id(session, tag_id)
    predicted_tag = schemas.PredictedTag(
        tag=tag,
        score=score,
    )
    return predicted_tag


async def from_soundevent(
    session: AsyncSession,
    data: data.PredictedTag,
) -> schemas.PredictedTag:
    """Get predicted tag from a soundevent PredictedTag object.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    data
        The soundevent PredictedTag object.

    Returns
    -------
    predicted_tag : schemas.PredictedTag
        Predicted tag.
    """
    tag = await tags.from_soundevent(session, data.tag)
    return schemas.PredictedTag(
        tag=tag,
        score=data.score,
    )


def to_soundevent(predicted_tag: schemas.PredictedTag) -> data.PredictedTag:
    """Get a soundevent PredictedTag object from a predicted tag.

    Parameters
    ----------
    predicted_tag
        The predicted tag.

    Returns
    -------
    data.PredictedTag
        The soundevent PredictedTag object.
    """
    return data.PredictedTag(
        tag=tags.to_soundevent(predicted_tag.tag),
        score=predicted_tag.score,
    )
