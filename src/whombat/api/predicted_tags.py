"""Python API to manage predicted tags."""


from sqlalchemy.ext.asyncio import AsyncSession
from whombat import schemas
from whombat.api import tags


async def create(
    session: AsyncSession,
    tag_id: int,
    score: float
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
    data.
) -> list[schemas.PredictedTag]:
    """Get predicted tags from a sound event prediction.

    Parameters
    ----------
    session
        SQLAlchemy database session.
    sound_event_prediction_id
        ID of the sound event prediction.

    Returns
    -------
    predicted_tags : list[schemas.PredictedTag]
        List of predicted tags.
    """
    predicted_tags = []
    prediction = await sound_event_predictions.get_by_id(
        session,
        sound_event_prediction_id,
    )
    for tag in prediction.predicted_tags:
        predicted_tags.append(
            schemas.PredictedTag(
                tag=tag.tag,
                score=tag.score,
            )
        )
    return predicted_tags
