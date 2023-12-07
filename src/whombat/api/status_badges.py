"""Python API for interacting with Tasks."""

from uuid import UUID

from soundevent import data
from sqlalchemy import and_, tuple_
from sqlalchemy.sql._typing import _ColumnExpressionArgument

from whombat import models, schemas
from whombat.api.common import BaseAPI
from whombat.api.users import users

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

    async def create(
        self,
        session,
        annotation_task: schemas.AnnotationTask,
        state: data.AnnotationState,
        user: schemas.SimpleUser | None = None,
        **kwargs,
    ) -> schemas.AnnotationStatusBadge:
        """Create a status badge.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        annotation_task
            The annotation task that this status badge belongs to.
        state
            The state of the annotation task.
        user
            The user attached to the status badge. This can
            have different meanings depending on the state of the annotation.
            If the state is `data.AnnotationState.assigned`, then the user
            is the user that the annotation task was assigned to. If the
            state is `data.AnnotationState.completed`, then the user is the
            user that completed the annotation task.
        **kwargs
            Additional keyword arguments to use when creating the status badge
            (e.g. `uuid` or `created_on`.)

        Returns
        -------
        schemas.AnnotationStatusBadge
            Created status badge.
        """
        return await self.create_from_data(
            session,
            schemas.AnnotationStatusBadgeCreate(
                annotation_task_id=annotation_task.id,
                user_id=user.id if user is not None else None,
                state=state,
            ),
            **kwargs,
        )

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
        user = None
        if data.owner is not None:
            user = await users.from_soundevent(session, data.owner)

        obj = await self.create(
            session,
            annotation_task=annotation_task,
            state=data.state,
            user=user,
            created_on=data.created_on,
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

    def _get_pk_condition(self, pk: PrimaryKey) -> _ColumnExpressionArgument:
        task_id, user_id, state = pk
        return and_(
            self._model.annotation_task_id == task_id,
            self._model.user_id == user_id,
            self._model.state == state,
        )

    def _get_pk_from_obj(
        self,
        obj: schemas.AnnotationStatusBadge,
    ) -> PrimaryKey:
        return obj.annotation_task_id, obj.user_id, obj.state

    def _key_fn(
        self,
        obj: models.AnnotationStatusBadge
        | schemas.AnnotationStatusBadgeCreate,
    ) -> PrimaryKey:
        return obj.annotation_task_id, obj.user_id, obj.state

    def _get_key_column(self):
        return tuple_(
            self._model.annotation_task_id,
            self._model.user_id,
            self._model.state,
        )


status_badges = StatusBadgeAPI()
