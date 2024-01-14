from uuid import UUID

from soundevent.io.aoef import (
    AnnotationSetObject,
    EvaluationObject,
    PredictionSetObject,
    RecordingSetObject,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models

AOEFObject = (
    EvaluationObject
    | AnnotationSetObject
    | PredictionSetObject
    | RecordingSetObject
)


async def get_mapping(
    session: AsyncSession,
    uuids: set[UUID],
    model: type[models.Base],
) -> dict[UUID, int]:
    if not uuids:
        return {}

    values = [str(uuid) for uuid in uuids]
    stmt = select(model.id, model.uuid).where(model.uuid.in_(values))  # type: ignore
    result = await session.execute(stmt)
    return {r[1]: r[0] for r in result.all()}
