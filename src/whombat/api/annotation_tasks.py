"""Python API for interacting with Tasks."""

from uuid import UUID

from soundevent import data
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common, users
from whombat.api.common import BaseAPI
from whombat.api.clips import clips
from whombat.api.status_badges import status_badges

__all__ = [
    "AnnotationTaskAPI",
    "annotation_tasks",
]


class AnnotationTaskAPI(
    BaseAPI[
        UUID,
        models.AnnotationTask,
        schemas.AnnotationTask,
        schemas.AnnotationTaskCreate,
        schemas.AnnotationTaskUpdate,
    ]
):
    """API for tasks."""

    _model = models.AnnotationTask
    _schema = schemas.AnnotationTask

    async def add_status_badge(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationTask,
        badge: schemas.AnnotationStatusBadge,
    ) -> schemas.AnnotationTask:
        """Add a status badge to a task.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Task to add the status badge to.
        badge
            Status badge to add.

        Returns
        -------
        schemas.AnnotationTask
            Task with the new status badge.
        """
        for b in obj.status_badges:
            if b.user == badge.user and b.state == badge.state:
                raise exceptions.DuplicateObjectError(
                    f"Status badge {badge} already exists in " f"task {obj.id}"
                )

        await common.create_object(
            session,
            models.AnnotationStatusBadge,
            schemas.AnnotationStatusBadgeCreate(
                user_id=badge.user.id if badge.user else None,
                state=badge.state,
                annotation_task_id=obj.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                status_badges=[*obj.status_badges, badge],
            )
        )
        return obj

    async def remove_status_badge(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationTask,
        badge: schemas.AnnotationStatusBadge,
    ) -> schemas.AnnotationTask:
        """Remove a status badge from a task.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Task to remove the status badge from.
        badge
            Status badge to remove.

        Returns
        -------
        schemas.AnnotationTask
            Task with the status badge removed.
        """
        for b in obj.status_badges:
            if b.user == badge.user and b.state == badge.state:
                user_id = b.user.id if b.user else None
                await common.delete_object(
                    session,
                    models.AnnotationStatusBadge,
                    and_(
                        models.AnnotationStatusBadge.annotation_task_id
                        == obj.id,
                        models.AnnotationStatusBadge.user_id == user_id,
                        models.AnnotationStatusBadge.state == b.state,
                    ),
                )
                break
        else:
            raise exceptions.NotFoundError(
                f"Status badge {badge} does not exist in " f"task {obj.id}"
            )

        obj = obj.model_copy(
            update=dict(
                status_badges=[b for b in obj.status_badges if b != badge],
            )
        )
        return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.AnnotationTask,
        annotation_project: schemas.AnnotationProject,
    ) -> schemas.AnnotationTask:
        """Get or create a task from a `soundevent` task.

        Parameters
        ----------
        session
            An async database session.
        data
            The `soundevent` task.
        annotation_project
            The annotation project to which the task belongs.

        Returns
        -------
        schemas.AnnotationTask
            The created task.
        """
        try:
            obj = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            obj = await self._create_from_soundevent(
                session,
                data,
                annotation_project,
            )

        return await self._update_from_soundevent(session, obj, data)

    def to_soundevent(
        self, task: schemas.AnnotationTask
    ) -> data.AnnotationTask:
        """Convert a task to a `soundevent` task.

        Parameters
        ----------
        task
            The task to convert.

        Returns
        -------
        data.AnnotationTask
            The converted task.
        """
        return data.AnnotationTask(
            uuid=task.uuid,
            clip=clips.to_soundevent(task.clip),
            status_badges=[
                data.StatusBadge(
                    owner=users.to_soundevent(sb.user) if sb.user else None,
                    state=sb.state,
                    created_on=sb.created_on,
                )
                for sb in task.status_badges
            ],
            created_on=task.created_on,
        )

    async def _update_from_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationTask,
        data: data.AnnotationTask,
    ) -> schemas.AnnotationTask:
        """Update a task from a `soundevent` task.

        Parameters
        ----------
        session
            An async database session.
        obj
            The task to update.
        data
            The `soundevent` task.

        Returns
        -------
        schemas.AnnotationTask
            The updated task.
        """
        current_status_badges = {
            (b.user_id, b.state) for b in obj.status_badges
        }
        for status_badge in data.status_badges:
            if (
                status_badge.owner.uuid if status_badge.owner else None,
                status_badge.state,
            ) in current_status_badges:
                continue

            badge = await status_badges.from_soundevent(
                session,
                status_badge,
                obj,
            )
            obj = await self.add_status_badge(
                session,
                obj,
                badge,
            )

        return obj

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.AnnotationTask,
        annotation_project: schemas.AnnotationProject,
    ) -> schemas.AnnotationTask:
        """Create a task from a `soundevent` task.

        Parameters
        ----------
        session
            An async database session.
        data
            The `soundevent` task.
        annotation_project_id
            The ID of the annotation project to which the task belongs.

        Returns
        -------
        schemas.AnnotationTask
            The created task.
        """
        clip = await clips.from_soundevent(session, data.clip)
        return await self.create(
            session,
            schemas.AnnotationTaskCreate(
                clip_id=clip.id,
                annotation_project_id=annotation_project.id,
                uuid=data.uuid,
                created_on=data.created_on,
            ),
        )


annotation_tasks = AnnotationTaskAPI()
