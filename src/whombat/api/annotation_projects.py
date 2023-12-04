"""Python API for annotation projects."""

from typing import Sequence
from uuid import UUID

from cachetools import LRUCache
from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import cache, exceptions, models, schemas
from whombat.api import clip_annotations, common
from whombat.filters.base import Filter
from whombat.filters.clip_annotations import AnnotationProjectFilter

__all__ = [
    "add_tag",
    "create",
    "delete",
    "get_by_id",
    "get_by_name",
    "get_by_uuid",
    "get_many",
    "remove_tag",
    "update",
    "get_annotations",
    "to_soundevent",
    "from_soundevent",
]


caches = cache.CacheCollection(schemas.AnnotationProject)


@caches.cached(
    name="annotation_project_by_id",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_project_id: annotation_project_id,
    data_key=lambda annotation_project: annotation_project.id,
)
async def get_by_id(
    session: AsyncSession,
    annotation_project_id: int,
) -> schemas.AnnotationProject:
    """Get an annotation project by its ID.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_id
        ID of the annotation project.

    Returns
    -------
    schemas.AnnotationProject
        Annotation project with the given ID.
    """
    annotation_project = await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.cached(
    name="annotation_project_by_uuid",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_project_uuid: annotation_project_uuid,
    data_key=lambda annotation_project: annotation_project.uuid,
)
async def get_by_uuid(
    session: AsyncSession, annotation_project_uuid: UUID
) -> schemas.AnnotationProject:
    """Get an annotation project by its UUID.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_uuid
        UUID of the annotation project.

    Returns
    -------
    schemas.AnnotationProject
        Annotation project with the given UUID.
    """
    annotation_project = await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.uuid == annotation_project_uuid,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.cached(
    name="annotation_project_by_name",
    cache=LRUCache(maxsize=1000),
    key=lambda _, annotation_project_name: annotation_project_name,
    data_key=lambda annotation_project: annotation_project.name,
)
async def get_by_name(
    session: AsyncSession, annotation_project_name: str
) -> schemas.AnnotationProject:
    """Get an annotation project by its name.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_name
        Name of the annotation project.

    Returns
    -------
    schemas.AnnotationProject
        Annotation project with the given name.
    """
    annotation_project = await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.name == annotation_project_name,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


async def get_many(
    session: AsyncSession,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.AnnotationProject], int]:
    """Get a list of annotation projects.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    limit
        Maximum number of annotation projects to return. By default 1000.
    offset
        Offset of the first annotation project to return. By default 0.
    filters
        Filters to apply. Only annotation projects matching all filters will
        be returned. By default None.
    sort_by
        Field to sort by.

    Returns
    -------
    annotation_projects : list[schemas.AnnotationProject]
        List of annotation projects.
    count : int
        Total number of annotation projects matching the given criteria.
        This number may be larger than the number of annotation projects
        returned if limit is smaller than the total number of annotation
        projects matching the given criteria.
    """
    annotation_projects, count = await common.get_objects(
        session,
        models.AnnotationProject,
        limit=limit,
        offset=offset,
        filters=filters,
        sort_by=sort_by,
    )
    return [
        schemas.AnnotationProject.model_validate(ap)
        for ap in annotation_projects
    ], count


@caches.with_update
async def create(
    session: AsyncSession,
    data: schemas.AnnotationProjectCreate,
) -> schemas.AnnotationProject:
    """Create an annotation project.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    data
        Annotation project to create.

    Returns
    -------
    schemas.AnnotationProject
        Created annotation project.
    """
    annotation_project = await common.create_object(
        session,
        models.AnnotationProject,
        data,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_update
async def update(
    session: AsyncSession,
    annotation_project_id: int,
    data: schemas.AnnotationProjectUpdate,
) -> schemas.AnnotationProject:
    """Update an annotation project.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_id
        ID of the annotation project to update.

    Returns
    -------
    schemas.AnnotationProject
        Updated annotation project.
    """
    annotation_project = await common.update_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
        data,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_clear
async def delete(
    session: AsyncSession,
    annotation_project_id: int,
) -> schemas.AnnotationProject:
    """Delete an annotation project.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_id
        ID of the annotation project to delete.

    Returns
    -------
    schemas.AnnotationProject
        Deleted annotation project.
    """
    annotation_project = await common.delete_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_update
async def add_tag(
    session: AsyncSession,
    annotation_project_id: int,
    tag_id: int,
) -> schemas.AnnotationProject:
    """Add a tag to an annotation project.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_id
        ID of the annotation project.
    tag_id
        ID of the tag to add.

    Returns
    -------
    schemas.AnnotationProject
        Annotation project with the tag added.
    """
    annotation_project = await common.add_tag_to_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
        tag_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


@caches.with_update
async def remove_tag(
    session: AsyncSession,
    annotation_project_id: int,
    tag_id: int,
) -> schemas.AnnotationProject:
    """Remove a tag from an annotation project.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_id
        ID of the annotation project.
    tag_id
        ID of the tag to remove.

    Returns
    -------
    schemas.AnnotationProject
        Annotation project with the tag removed.
    """
    annotation_project = await common.remove_tag_from_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
        tag_id,
    )
    return schemas.AnnotationProject.model_validate(annotation_project)


async def get_annotations(
    session: AsyncSession,
    annotation_project_id: int,
    *,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
    sort_by: str | None = "-created_on",
) -> tuple[list[schemas.ClipAnnotation], int]:
    """Get a list of annotations for an annotation project.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project_id
        ID of the annotation project.
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
    # Check it exists
    await common.get_object(
        session,
        models.AnnotationProject,
        models.AnnotationProject.id == annotation_project_id,
    )

    return await clip_annotations.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[
            AnnotationProjectFilter(eq=annotation_project_id),
            *(filters or []),
        ],
        sort_by=sort_by,
    )


async def from_soundevent(
    session: AsyncSession,
    data: data.AnnotationProject,
) -> schemas.AnnotationProject:
    """Convert a soundevent Annotation Project to a Whombat annotation project.

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
        annotation_project = await get_by_uuid(session, data.uuid)
    except exceptions.NotFoundError:
        annotation_project = await create(
            session,
            schemas.AnnotationProjectCreate(
                uuid=data.uuid,
                name=data.name,
                description=data.description or "",
                annotation_instructions=data.instructions or "",
                created_on=data.created_on,
            ),
        )

    for clip_annotation in data.clip_annotations:
        await clip_annotations.from_soundevent(session, clip_annotation)

    return annotation_project


async def to_soundevent(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
) -> data.AnnotationProject:
    """Convert a Whombat annotation project to a soundevent annotation project.

    Parameters
    ----------
    session
        SQLAlchemy AsyncSession.
    annotation_project
        Whombat annotation project.

    Returns
    -------
    data.AnnotationProject
        soundevent annotation project.
    """
    annotations, _ = await get_annotations(
        session,
        annotation_project.id,
        limit=-1,
    )

    se_clip_annotations = [
        clip_annotations.to_soundevent(ca) for ca in annotations
    ]

    return data.AnnotationProject(
        uuid=annotation_project.uuid,
        name=annotation_project.name,
        description=annotation_project.description,
        instructions=annotation_project.annotation_instructions,
        created_on=annotation_project.created_on,
        clip_annotations=se_clip_annotations,
    )
