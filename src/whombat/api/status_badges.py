"""Python API for interacting with Tasks."""

from uuid import UUID

from soundevent import data
from sqlalchemy import and_, tuple_
from sqlalchemy.sql._typing import _ColumnExpressionArgument

from whombat import models, schemas
from whombat.api import users
from whombat.api.common import BaseAPI

PrimaryKey = tuple[int, UUID | None, data.AnnotationState]


__all__ = [
    "StatusBadgeAPI",
    "status_badges",
]


class StatusBadgeAPI(
    BaseAPI[
        PrimaryKey,
        models.AnnotationStatusBadge,
        schemas.AnnotationStatusBadge,
        schemas.AnnotationStatusBadgeCreate,
        schemas.AnnotationStatusBadgeUpdate,
    ]
):
    """API for status badges."""

    _model = models.AnnotationStatusBadge
    _schema = schemas.AnnotationStatusBadge

    async def from_soundevent(
        self,
        session,
        data: data.StatusBadge,
        annotation_task: schemas.AnnotationTask,
    ) -> schemas.AnnotationStatusBadge:
        """Create a status badge from a soundevent status badge.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        data
            Soundevent status badge.

        Returns
        -------
        schemas.AnnotationStatusBadge
            Status badge.
        """
        user_id = None
        if data.owner is not None:
            user = await users.from_soundevent(session, data.owner)
            user_id = user.id

        obj = await self.create(
            session,
            schemas.AnnotationStatusBadgeCreate(
                created_on=data.created_on,
                annotation_task_id=annotation_task.id,
                user_id=user_id,
                state=data.state,
            ),
        )

        self._update_cache(obj)
        return obj

    def to_soundevent(
        self,
        obj: schemas.AnnotationStatusBadge,
    ) -> data.StatusBadge:
        """Convert a status badge to a soundevent status badge.

        Parameters
        ----------
        obj
            Status badge to convert.

        Returns
        -------
        data.StatusBadge
            Soundevent status badge.
        """
        owner = None
        if obj.user is not None:
            owner = users.to_soundevent(obj.user)

        return data.StatusBadge(
            created_on=obj.created_on,
            owner=owner,
            state=obj.state,
        )

    @classmethod
    def _get_pk_condition(cls, pk: PrimaryKey) -> _ColumnExpressionArgument:
        task_id, user_id, state = pk
        return and_(
            cls._model.annotation_task_id == task_id,
            cls._model.user_id == user_id,
            cls._model.state == state,
        )

    @classmethod
    def _get_pk_from_obj(
        cls,
        obj: schemas.AnnotationStatusBadge,
    ) -> PrimaryKey:
        return obj.annotation_task_id, obj.user_id, obj.state

    @classmethod
    def _key_fn(
        cls,
        obj: models.AnnotationStatusBadge | schemas.AnnotationStatusBadge,
    ) -> PrimaryKey:
        return obj.annotation_task_id, obj.user_id, obj.state

    @classmethod
    def _get_key_column(cls):
        return tuple_(
            cls._model.annotation_task_id,
            cls._model.user_id,
            cls._model.state,
        )


status_badges = StatusBadgeAPI()
