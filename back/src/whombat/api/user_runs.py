from pathlib import Path
from typing import Sequence
from uuid import UUID

from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api.clip_predictions import clip_predictions
from whombat.api.common import BaseAPI, create_object
from whombat.filters.base import Filter
from whombat.filters.clip_predictions import UserRunFilter


class UserRunAPI(
    BaseAPI[
        UUID,
        models.UserRun,
        schemas.UserRun,
        schemas.UserRunCreate,
        schemas.UserRunUpdate,
    ]
):
    _model = models.UserRun
    _schema = schemas.UserRun

    async def create(
        self,
        session: AsyncSession,
        user: schemas.SimpleUser,
        **kwargs,
    ) -> schemas.UserRun:
        """Create a user run.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        user
            The user that created the run.
        **kwargs
            Additional keyword arguments to use when creating the user run,
            (e.g. `uuid` or `created_on`.)

        Returns
        -------
        schemas.UserRun
            Created user run.
        """
        return await self.create_from_data(
            session,
            user_id=user.id,
            **kwargs,
        )

    async def get_clip_predictions(
        self,
        session: AsyncSession,
        obj: schemas.UserRun,
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
                UserRunFilter(eq=obj.uuid),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    async def add_clip_prediction(
        self,
        session: AsyncSession,
        obj: schemas.UserRun,
        clip_prediction: schemas.ClipPrediction,
        raise_if_exists: bool = False,
    ) -> schemas.UserRun:
        try:
            await create_object(
                session,
                models.UserRunPrediction,
                user_run_id=obj.id,
                clip_prediction_id=clip_prediction.id,
            )
        except exceptions.DuplicateObjectError as err:
            if raise_if_exists:
                raise err
        return obj

    async def update_from_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.UserRun,
        data: data.PredictionSet,
    ) -> schemas.UserRun:
        for clip_prediction in data.clip_predictions:
            prediction = await clip_predictions.from_soundevent(
                session,
                clip_prediction,
            )
            obj = await self.add_clip_prediction(session, obj, prediction)
        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.PredictionSet,
        user: schemas.SimpleUser,
    ) -> schemas.UserRun:
        try:
            model_run = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            model_run = await self.create(
                session,
                user=user,
                created_on=data.created_on,
                uuid=data.uuid,
            )
        return await self.update_from_soundevent(session, model_run, data)

    async def to_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.UserRun,
        audio_dir: Path | None = None,
    ) -> data.PredictionSet:
        predictions, _ = await self.get_clip_predictions(
            session, obj, limit=-1
        )
        return data.PredictionSet(
            uuid=obj.uuid,
            created_on=obj.created_on,
            clip_predictions=[
                await clip_predictions.to_soundevent(
                    session,
                    cp,
                    audio_dir=audio_dir,
                )
                for cp in predictions
            ],
        )


user_runs = UserRunAPI()
