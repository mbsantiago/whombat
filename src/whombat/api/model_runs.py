"""API functions to interact with model runs."""
from typing import Sequence
from uuid import UUID

from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api.clip_predictions import clip_predictions
from whombat.api.common import BaseAPI, create_object
from whombat.filters.base import Filter
from whombat.filters.clip_predictions import ModelRunFilter


class ModelRunAPI(
    BaseAPI[
        UUID,
        models.ModelRun,
        schemas.ModelRun,
        schemas.ModelRunCreate,
        schemas.ModelRunUpdate,
    ]
):
    _model = models.ModelRun
    _schema = schemas.ModelRun

    async def get_clip_predictions(
        self,
        session: AsyncSession,
        obj: schemas.ModelRun,
        *,
        limit: int | None = 1000,
        offset: int = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = None,
    ) -> tuple[Sequence[schemas.ClipPrediction], int]:
        return await clip_predictions.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[
                ModelRunFilter(eq=obj.id),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    async def add_clip_prediction(
        self,
        session: AsyncSession,
        obj: schemas.ModelRun,
        clip_prediction: schemas.ClipPrediction,
        raise_if_exists: bool = False,
    ) -> schemas.ModelRun:
        try:
            await create_object(
                session,
                models.ModelRunPrediction,
                schemas.ModelRunPredictionCreate(
                    model_run_id=obj.id,
                    clip_prediction_id=clip_prediction.id,
                ),
            )
        except exceptions.DuplicateObjectError as err:
            if raise_if_exists:
                raise err
        return obj

    async def update_from_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.ModelRun,
        data: data.ModelRun,
    ) -> schemas.ModelRun:
        for clip_prediction in data.clip_predictions:
            prediction = await clip_predictions.from_soundevent(
                session,
                clip_prediction,
            )
            obj = await self.add_clip_prediction(session, obj, prediction)
        return obj

    async def from_soundevent(
        self, session: AsyncSession, data: data.ModelRun
    ) -> schemas.ModelRun:
        try:
            model_run = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            model_run = await self.create(
                session,
                schemas.ModelRunCreate(
                    uuid=data.uuid,
                    created_on=data.created_on,
                    name=data.name,
                    version=data.version or "",
                    description=data.description,
                ),
            )
        return await self.update_from_soundevent(session, model_run, data)

    async def to_soundevent(
        self, session: AsyncSession, obj: schemas.ModelRun
    ) -> data.ModelRun:
        predictions, _ = await self.get_clip_predictions(
            session, obj, limit=-1
        )
        return data.ModelRun(
            uuid=obj.uuid,
            created_on=obj.created_on,
            name=obj.name,
            version=obj.version,
            description=obj.description,
            clip_predictions=[
                clip_predictions.to_soundevent(cp) for cp in predictions
            ],
        )


model_runs = ModelRunAPI()
