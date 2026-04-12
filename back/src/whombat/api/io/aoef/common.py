import json
from pathlib import Path
from typing import BinaryIO
from uuid import UUID

from pydantic import ValidationError
from soundevent.io.aoef import AOEFObject
from sqlalchemy import bindparam, select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models
from whombat.api import common


async def get_mapping(
    session: AsyncSession,
    uuids: set[UUID],
    model: type[models.Base],
) -> dict[UUID, int]:
    if not uuids:
        return {}

    result = await common.select_batched(
        session,
        statement=select(model.id, model.uuid).where(  # type: ignore
            model.uuid.in_(bindparam("uuids"))  # type: ignore
        ),
        parameter="uuids",
        values=list(uuids),
    )
    return {r[1]: r[0] for r in result}


def parse_aoef_object(src: Path | BinaryIO | str) -> AOEFObject:
    try:
        if isinstance(src, (Path, str)):
            with open(src, "r") as file:
                data = json.load(file)
        else:
            data = json.loads(src.read())
    except json.JSONDecodeError as e:
        raise exceptions.DataFormatError(
            message=("Invalid JSON file.Expected a JSON file in AOEF format."),
            format="json",
            details=str(e),
        ) from e

    try:
        obj = AOEFObject.model_validate(data)
    except ValidationError as e:
        raise exceptions.DataFormatError(
            message=(
                "Invalid Annotation Project file. "
                "Expected a JSON file in AOEF format."
            ),
            format="aoef",
            details=str(e),
        ) from e

    return obj
