"""Python API for interacting with Tasks."""

from pathlib import Path
from uuid import UUID

from soundevent import data
from sqlalchemy import and_, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.clip_annotations import clip_annotations
from whombat.api.clips import clips
from whombat.api.common import BaseAPI
from whombat.api.users import users
from whombat.filters.base import Filter

__all__ = [
    "AnnotationTaskAPI",
    "annotation_tasks",
]


class AnnotationTaskFilter(Filter):
    eq: int

    def filter(self, query):
        return query.join(
            models.AnnotationTask,
            models.Clip.id == models.AnnotationTask.clip_id,
        ).filter(models.AnnotationTask.annotation_project_id == self.eq)


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

    async def get_clip_annotation(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationTask,
    ) -> schemas.ClipAnnotation:
        """Get clip annotations for a task.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Task for which to get the annotations.

        Returns
        -------
        list[schemas.Annotation]
            Annotations for the task.
        """
        stmt = (
            select(models.ClipAnnotation.uuid)
            .select_from(models.ClipAnnotation)
            .join(
                models.AnnotationTask,
                models.ClipAnnotation.id
                == models.AnnotationTask.clip_annotation_id,
            )
            .filter(models.AnnotationTask.id == obj.id)
        )
        results = await session.execute(stmt)
        uuid = results.scalars().first()
        if not uuid:
            raise exceptions.NotFoundError(
                "No clip annotation found for task {obj}"
            )
        return await clip_annotations.get(session, uuid)

    async def create(
        self,
        session: AsyncSession,
        annotation_project: schemas.AnnotationProject,
        clip: schemas.Clip,
        **kwargs,
    ) -> schemas.AnnotationTask:
        """Create a task.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        annotation_project
            Annotation project to which the task belongs.
        clip
            Clip to annotate.
        **kwargs
            Additional keyword arguments to pass to the creation
            (e.g. `uuid`).

        Returns
        -------
        schemas.AnnotationTask
            Created task.
        """
        return await self.create_from_data(
            session,
            annotation_project_id=annotation_project.id,
            clip_id=clip.id,
            **kwargs,
        )

    async def add_status_badge(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationTask,
        state: data.AnnotationState,
        user: schemas.SimpleUser | None = None,
    ) -> schemas.AnnotationTask:
        """Add a status badge to a task.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Task to add the status badge to.
        state
            State of the status badge.
        user
            User that owns the status badge.

        Returns
        -------
        schemas.AnnotationTask
            Task with the new status badge.
        """
        for b in obj.status_badges:
            if b.user == user and b.state == state:
                raise exceptions.DuplicateObjectError(
                    f"Status badge {b} already exists in task {obj.id}"
                )

        badge = await common.create_object(
            session,
            models.AnnotationStatusBadge,
            state=state,
            annotation_task_id=obj.id,
            user_id=user.id if user else None,
        )

        obj = obj.model_copy(
            update=dict(
                status_badges=[
                    *obj.status_badges,
                    schemas.AnnotationStatusBadge.model_validate(badge),
                ],
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_status_badge(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationTask,
        state: data.AnnotationState,
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
            if b.state == state:
                break
        else:
            raise exceptions.NotFoundError(
                f"Status badge with state {state} not found in task {obj.id}"
            )

        await common.delete_object(
            session,
            models.AnnotationStatusBadge,
            and_(
                models.AnnotationStatusBadge.annotation_task_id == obj.id,
                models.AnnotationStatusBadge.state == b.state,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                status_badges=[
                    b for b in obj.status_badges if (b.state != state)
                ],
            ),
            deep=True,
        )
        self._update_cache(obj)
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

    async def get_clip(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationTask,
    ) -> schemas.Clip:
        """Get the clip of a task.

        Parameters
        ----------
        obj
            The task.

        Returns
        -------
        schemas.Clip
            The clip of the task.
        """
        return await clips.find(
            session,
            filters=[AnnotationTaskFilter(eq=obj.id)],
        )

    async def to_soundevent(
        self,
        session: AsyncSession,
        task: schemas.AnnotationTask,
        clip: schemas.Clip | None = None,
        audio_dir: Path | None = None,
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
        if clip is None:
            clip = await self.get_clip(session, task)
        return data.AnnotationTask(
            uuid=task.uuid,
            clip=clips.to_soundevent(clip, audio_dir=audio_dir),
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
            (b.user.id if b.user else None, b.state) for b in obj.status_badges
        }
        for status_badge in data.status_badges:
            if (
                status_badge.owner.uuid if status_badge.owner else None,
                status_badge.state,
            ) in current_status_badges:
                continue

            user = None
            if status_badge.owner:
                user = await users.from_soundevent(session, status_badge.owner)

            obj = await self.add_status_badge(
                session,
                obj,
                state=status_badge.state,
                user=user,
            )

        return obj

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.AnnotationTask,
        annotation_project: schemas.AnnotationProject,
        clip: schemas.Clip | None = None,
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
        if clip is None:
            clip = await clips.from_soundevent(session, data.clip)
        return await self.create(
            session,
            clip=clip,
            annotation_project=annotation_project,
            uuid=data.uuid,
            created_on=data.created_on,
        )

    def _key_fn(self, obj: dict):
        return (obj.get("annotation_project_id"), obj.get("clip_id"))

    def _get_key_column(self):
        return tuple_(
            models.AnnotationTask.annotation_project_id,
            models.AnnotationTask.clip_id,
        )


annotation_tasks = AnnotationTaskAPI()
