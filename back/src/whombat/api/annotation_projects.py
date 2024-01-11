"""Python API for annotation projects."""

from pathlib import Path
from typing import Sequence
from uuid import UUID

from soundevent import data
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.annotation_tasks import annotation_tasks
from whombat.api.clip_annotations import clip_annotations
from whombat.api.common import BaseAPI
from whombat.filters.annotation_tasks import (
    AnnotationProjectFilter as AnnotationTaskAnnotationProjectFilter,
)
from whombat.filters.base import Filter
from whombat.filters.clip_annotations import AnnotationProjectFilter

__all__ = [
    "AnnotationProjectAPI",
    "annotation_projects",
]


class AnnotationProjectAPI(
    BaseAPI[
        UUID,
        models.AnnotationProject,
        schemas.AnnotationProject,
        schemas.AnnotationProjectCreate,
        schemas.AnnotationProjectUpdate,
    ]
):
    _model = models.AnnotationProject
    _schema = schemas.AnnotationProject

    async def create(
        self,
        session: AsyncSession,
        name: str,
        description: str,
        annotation_instructions: str | None = None,
        **kwargs,
    ) -> schemas.AnnotationProject:
        """Create an annotation project.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        name
            Name of the annotation project.
        description
            Description of the annotation project.
        annotation_instructions
            Intructions for annotators on how to successfully annotate
            an annotation task. This is important for ensuring that
            annotations are consistent across annotators, and provides
            a unambiguous definition of what a completed annotation
            task should look like.
        **kwargs
            Additional keyword arguments to pass to the creation.

        Returns
        -------
        schemas.AnnotationProject
            Created annotation project.
        """
        return await self.create_from_data(
            session,
            schemas.AnnotationProjectCreate(
                name=name,
                description=description,
                annotation_instructions=annotation_instructions,
            ),
            **kwargs,
        )

    async def add_tag(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationProject,
        tag: schemas.Tag,
    ) -> schemas.AnnotationProject:
        """Add a tag to an annotation project.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Annotation project to add the tag to.
        tag
            Tag to add.

        Returns
        -------
        schemas.AnnotationProject
            Annotation project with the tag added.
        """
        for t in obj.tags:
            if t.id == tag.id:
                raise exceptions.DuplicateObjectError(
                    f"Tag {tag.id} already exists in annotation "
                    f"project {obj.id}"
                )

        await common.create_object(
            session,
            models.AnnotationProjectTag,
            annotation_project_id=obj.id,
            tag_id=tag.id,
        )

        obj = obj.model_copy(
            update=dict(
                tags=[*obj.tags, tag],
            )
        )
        self._update_cache(obj)
        return obj

    async def remove_tag(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationProject,
        tag: schemas.Tag,
    ) -> schemas.AnnotationProject:
        """Remove a tag from an annotation project.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Annotation project to remove the tag from.
        tag
            Tag to remove.

        Returns
        -------
        schemas.AnnotationProject
            Annotation project with the tag removed.
        """
        for t in obj.tags:
            if t.id == tag.id:
                break
        else:
            raise exceptions.NotFoundError(
                f"Tag {tag.id} does not exist in annotation "
                f"project {obj.id}"
            )

        await common.delete_object(
            session,
            models.AnnotationProjectTag,
            and_(
                models.AnnotationProjectTag.annotation_project_id == obj.id,
                models.AnnotationProjectTag.tag_id == tag.id,
            ),
        )

        obj = obj.model_copy(
            update=dict(
                tags=[t for t in obj.tags if t.id != tag.id],
            )
        )
        self._update_cache(obj)
        return obj

    async def get_annotations(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationProject,
        *,
        limit: int = 1000,
        offset: int = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = "-created_on",
    ) -> tuple[Sequence[schemas.ClipAnnotation], int]:
        """Get a list of annotations for an annotation project.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Annotation project to get annotations for.
        limit
            Maximum number of annotations to return. By default 1000.
        offset
            Offset of the first annotation to return. By default 0.
        filters
            Filters to apply. Only annotations matching all filters will
            be returned. By default None.
        sort_by
            Field to sort by.

        Returns
        -------
        annotations : list[schemas.ClipAnnotation]
            List of clip annotations.
        count : int
            Total number of annotations matching the given criteria.
            This number may be larger than the number of annotations
            returned if limit is smaller than the total number of annotations
            matching the given criteria.
        """
        return await clip_annotations.get_many(
            session,
            limit=limit,
            offset=offset,
            filters=[
                AnnotationProjectFilter(eq=obj.uuid),
                *(filters or []),
            ],
            sort_by=sort_by,
        )

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.AnnotationProject,
    ) -> schemas.AnnotationProject:
        """Convert a soundevent Annotation Project to a Whombat annotation
        project.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        data
            soundevent annotation project.

        Returns
        -------
        schemas.AnnotationProject
            Whombat annotation project.
        """
        try:
            annotation_project = await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            annotation_project = await self.create(
                session,
                name=data.name,
                description=data.description or "",
                annotation_instructions=data.instructions or "",
                uuid=data.uuid,
                created_on=data.created_on,
            )

        for clip_annotation in data.clip_annotations:
            await clip_annotations.from_soundevent(session, clip_annotation)

        return annotation_project

    async def to_soundevent(
        self,
        session: AsyncSession,
        obj: schemas.AnnotationProject,
        audio_dir: Path | None = None,
    ) -> data.AnnotationProject:
        """Convert a Whombat annotation project to a soundevent annotation
        project.

        Parameters
        ----------
        session
            SQLAlchemy AsyncSession.
        obj
            Whombat annotation project.

        Returns
        -------
        data.AnnotationProject
            soundevent annotation project.
        """
        tasks, _ = await annotation_tasks.get_many(
            session,
            limit=-1,
            filters=[AnnotationTaskAnnotationProjectFilter(eq=obj.uuid)],
        )

        stmt = (
            select(models.Clip, models.AnnotationTask.id)
            .join(
                models.AnnotationTask,
                models.Clip.id == models.AnnotationTask.clip_id,
            )
            .where(
                models.AnnotationTask.id.in_({t.id for t in tasks}),
            )
        )
        results = await session.execute(stmt)
        mapping = {r[1]: r[0] for r in results.unique().all()}

        se_tasks = [
            await annotation_tasks.to_soundevent(
                session,
                task,
                audio_dir=audio_dir,
                clip=mapping[task.id],
            )
            for task in tasks
            if task.id in mapping
        ]

        annotations, _ = await self.get_annotations(session, obj, limit=-1)
        se_clip_annotations = [
            await clip_annotations.to_soundevent(
                session, ca, audio_dir=audio_dir
            )
            for ca in annotations
        ]

        return data.AnnotationProject(
            uuid=obj.uuid,
            name=obj.name,
            description=obj.description,
            instructions=obj.annotation_instructions,
            created_on=obj.created_on,
            clip_annotations=se_clip_annotations,
            tasks=se_tasks,
        )


annotation_projects = AnnotationProjectAPI()
