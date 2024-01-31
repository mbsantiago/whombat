"""API functions for interacting with evaluation sets."""

import uuid
from pathlib import Path
from typing import Sequence

from soundevent import data
from sqlalchemy import and_, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api.clip_annotations import clip_annotations
from whombat.api.common import (
    BaseAPI,
    create_object,
    create_objects_without_duplicates,
    delete_object,
)
from whombat.api.model_runs import model_runs
from whombat.api.tags import tags
from whombat.api.user_runs import user_runs
from whombat.filters.base import Filter
from whombat.filters.clip_annotations import (
    EvaluationSetFilter as ClipAnnotationEvaluationSetFilter,
)
from whombat.filters.model_runs import (
    EvaluationSetFilter as ModelRunEvaluationSetFilter,
)
from whombat.filters.user_runs import (
    EvaluationSetFilter as UserRunEvaluationSetFilter,
)

__all__ = [
    "EvaluationSetAPI",
]


class EvaluationSetAPI(
    BaseAPI[
        uuid.UUID,
        models.EvaluationSet,
        schemas.EvaluationSet,
        schemas.EvaluationSetCreate,
        schemas.EvaluationSetUpdate,
    ]
):
    _model = models.EvaluationSet
    _schema = schemas.EvaluationSet

    async def create(
        self,
        session: AsyncSession,
        name: str,
        description: str | None = None,
        task: str = "sound_event_detection",
        **kwargs,
    ) -> schemas.EvaluationSet:
        """Create an evaluation set.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        name
            Name of the evaluation set.
        description
            A description of the evaluation set. Include information about
            how the evaluation set was created and what it is meant to be
            used for.
        task
            The task the evaluation set is used for. For example,
            Sound Event Detection.
        **kwargs
            Additional keyword arguments to pass to the create function.

        Returns
        -------
        schemas.EvaluationSet
            Created evaluation set.
        """
        return await self.create_from_data(
            session,
            schemas.EvaluationSetCreate(
                name=name,
                description=description,
                task=task,
            ),
            **kwargs,
        )

    async def add_clip_annotation(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        annotation: schemas.ClipAnnotation,
    ) -> schemas.EvaluationSet:
        """Add a clip annotation to an evaluation set."""
        await create_object(
            session,
            models.EvaluationSetAnnotation,
            evaluation_set_id=obj.id,
            clip_annotation_id=annotation.id,
        )
        return obj

    async def add_annotation_tasks(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        annotation_task_uuids: Sequence[uuid.UUID],
    ) -> schemas.EvaluationSet:
        """Add multiple annotation tasks to an evaluation set."""
        stmt = (
            select(
                models.ClipAnnotation.id,
                models.AnnotationTask.uuid,
            )
            .join(
                models.AnnotationTask,
                models.ClipAnnotation.id
                == models.AnnotationTask.clip_annotation_id,
            )
            .where(models.AnnotationTask.uuid.in_(annotation_task_uuids))
        )
        result = await session.execute(stmt)
        mapping = {r[1]: r[0] for r in result.all()}
        await create_objects_without_duplicates(
            session,
            model=models.EvaluationSetAnnotation,
            data=[
                dict(
                    evaluation_set_id=obj.id,
                    clip_annotation_id=mapping[uuid],
                )
                for uuid in annotation_task_uuids
            ],
            key=lambda x: (x["evaluation_set_id"], x["clip_annotation_id"]),
            key_column=tuple_(
                models.EvaluationSetAnnotation.evaluation_set_id,
                models.EvaluationSetAnnotation.clip_annotation_id,
            ),
            return_all=True,
        )
        return obj

    async def remove_clip_annotation(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        annotation: schemas.ClipAnnotation,
    ) -> schemas.EvaluationSet:
        """Remove a clip annotation from an evaluation set."""
        await delete_object(
            session,
            models.EvaluationSetAnnotation,
            and_(
                models.EvaluationSetAnnotation.evaluation_set_id == obj.id,
                models.EvaluationSetAnnotation.clip_annotation_id
                == annotation.id,
            ),
        )
        return obj

    async def add_tag(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        tag: schemas.Tag,
    ) -> schemas.EvaluationSet:
        """Add a tag to an annotation project."""
        if tag in obj.tags:
            raise ValueError(
                f"Annotation project {obj.id} already has tag {tag.id}."
            )

        await create_object(
            session,
            models.EvaluationSetTag,
            evaluation_set_id=obj.id,
            tag_id=tag.id,
        )

        obj = obj.model_copy(update=dict(tags=[*obj.tags, tag]))
        self._update_cache(obj)
        return obj

    async def remove_tag(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        tag: schemas.Tag,
    ) -> schemas.EvaluationSet:
        """Remove a tag from an annotation project."""
        if tag not in obj.tags:
            raise ValueError(
                f"Annotation project {obj.id} does not have tag {tag.id}."
            )

        await delete_object(
            session,
            models.EvaluationSetTag,
            and_(
                models.EvaluationSetTag.evaluation_set_id == obj.id,
                models.EvaluationSetTag.tag_id == tag.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(tags=[t for t in obj.tags if t.id != tag.id])
        )
        self._update_cache(obj)
        return obj

    async def get_model_runs(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        *,
        limit: int = 100,
        offset: int = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = None,
    ) -> tuple[Sequence[schemas.ModelRun], int]:
        """Get all model runs in an evaluation set."""
        return await model_runs.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[
                ModelRunEvaluationSetFilter(eq=obj.uuid),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    async def add_model_run(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        model_run: schemas.ModelRun,
    ) -> schemas.EvaluationSet:
        """Add a model run to an evaluation set."""
        await create_object(
            session,
            models.EvaluationSetModelRun,
            evaluation_set_id=obj.id,
            model_run_id=model_run.id,
        )

        return obj

    async def remove_model_run(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        model_run: schemas.ModelRun,
    ) -> schemas.EvaluationSet:
        """Remove a model run from an evaluation set."""
        await delete_object(
            session,
            models.EvaluationSetModelRun,
            and_(
                models.EvaluationSetModelRun.evaluation_set_id == obj.id,
                models.EvaluationSetModelRun.model_run_id == model_run.id,
            ),
        )

        return obj

    async def get_user_runs(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        *,
        limit: int = 100,
        offset: int = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = None,
    ) -> tuple[Sequence[schemas.UserRun], int]:
        """Get all user runs in an evaluation set."""
        return await user_runs.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[
                UserRunEvaluationSetFilter(eq=obj.uuid),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    async def add_user_run(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        user_run: schemas.UserRun,
    ) -> schemas.EvaluationSet:
        """Add a user run to an evaluation set."""
        await create_object(
            session,
            models.EvaluationSetUserRun,
            evaluation_set_id=obj.id,
            user_run_id=user_run.id,
        )

        return obj

    async def remove_user_run(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        user_run: schemas.UserRun,
    ) -> schemas.EvaluationSet:
        """Remove a user run from an evaluation set."""
        await delete_object(
            session,
            models.EvaluationSetUserRun,
            and_(
                models.EvaluationSetUserRun.evaluation_set_id == obj.id,
                models.EvaluationSetUserRun.user_run_id == user_run.id,
            ),
        )

        return obj

    async def get_clip_annotations(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        *,
        limit: int = 100,
        offset: int = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = "-created_on",
    ) -> tuple[Sequence[schemas.ClipAnnotation], int]:
        """Get all clip annotations in an evaluation set."""
        return await clip_annotations.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[
                ClipAnnotationEvaluationSetFilter(eq=obj.uuid),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    async def from_soundevent(
        self, session: AsyncSession, data: data.EvaluationSet
    ) -> schemas.EvaluationSet:
        """Create an evaluation set from an object in `soundevent` format."""
        try:
            obj = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            obj = await self._create_from_soundevent(session, data)

        self._update_cache(obj)
        return obj

    async def to_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        audio_dir: Path | None = None,
    ) -> data.EvaluationSet:
        """Create an object in `soundevent` format from an evaluation set."""
        anns, _ = await self.get_clip_annotations(session, obj, limit=-1)

        return data.EvaluationSet(
            uuid=obj.uuid,
            created_on=obj.created_on,
            name=obj.name,
            description=obj.description,
            evaluation_tags=[tags.to_soundevent(t) for t in obj.tags],
            clip_annotations=[
                await clip_annotations.to_soundevent(
                    session,
                    a,
                    audio_dir=audio_dir,
                )
                for a in anns
            ],
        )

    async def _create_from_soundevent(
        self,
        session: AsyncSession,
        data: data.EvaluationSet,
    ) -> schemas.EvaluationSet:
        """Create an evaluation set from an object in `soundevent` format."""
        obj = await self.create(
            session,
            name=data.name,
            description=data.description,
            uuid=data.uuid,
            created_on=data.created_on,
        )
        return obj

    async def _update_from_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.EvaluationSet,
        data: data.EvaluationSet,
    ) -> schemas.EvaluationSet:
        """Update an evaluation set from an object in `soundevent` format."""

        _existing_tags = {(t.key, t.value) for t in obj.tags}
        for t in data.evaluation_tags:
            if (t.key, t.value) not in _existing_tags:
                tag = await tags.from_soundevent(session, t)
                obj = await self.add_tag(session, obj, tag)

        for a in data.clip_annotations:
            ann = await clip_annotations.from_soundevent(session, a)
            obj = await self.add_clip_annotation(session, obj, ann)

        return obj


evaluation_sets = EvaluationSetAPI()
