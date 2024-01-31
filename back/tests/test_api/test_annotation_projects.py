"""Test suite for annotation project API."""

from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, exceptions, models, schemas


async def test_created_annotation_is_stored_in_the_database(
    session: AsyncSession,
):
    """Test that an annotation project is stored in the database."""
    annotation_project = await api.annotation_projects.create(
        session,
        name="Test Annotation Project",
        description="A test annotation project.",
    )
    assert annotation_project.id is not None

    stmt = select(models.AnnotationProject).where(
        models.AnnotationProject.id == annotation_project.id
    )
    result = await session.execute(stmt)
    db_annotation_project = result.scalars().first()
    assert db_annotation_project is not None
    assert db_annotation_project.id == annotation_project.id
    assert db_annotation_project.name == annotation_project.name
    assert db_annotation_project.description == annotation_project.description


async def test_created_annotations_return_type_is_correct(
    session: AsyncSession,
):
    """Test that the return type of create_annotation_project is correct."""
    annotation_project = await api.annotation_projects.create(
        session,
        name="Test Annotation Project",
        description="A test annotation project.",
    )
    assert isinstance(annotation_project, schemas.AnnotationProject)


async def test_cannot_create_an_annotation_project_with_a_duplicate_name(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project fails with a duplicate name."""
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.annotation_projects.create(
            session,
            name=annotation_project.name,
            description="foo",
        )


async def test_cannot_create_an_annotation_project_with_duplicate_uuid(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project fails with a duplicate uuid."""
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.annotation_projects.create(
            session,
            name="foo",
            description="bar",
            uuid=annotation_project.uuid,
        )


async def test_can_create_a_project_with_a_given_uuid(
    session: AsyncSession,
):
    """Test that an annotation project can be created with a given uuid."""
    uuid = uuid4()
    data = await api.annotation_projects.create(
        session,
        name="Test Annotation Project",
        description="A test annotation project.",
        uuid=uuid,
    )
    annotation_project = await api.annotation_projects.get(
        session,
        data.uuid,
    )
    assert annotation_project.uuid == uuid


async def test_can_get_a_project_by_uuid(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project can be retrieved by its uuid."""
    retrieved_annotation_project = await api.annotation_projects.get(
        session,
        annotation_project.uuid,
    )
    assert retrieved_annotation_project == annotation_project


async def test_can_update_project_name(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project can be updated."""
    new_name = "New Name"
    updated_annotation_project = await api.annotation_projects.update(
        session,
        annotation_project,
        schemas.AnnotationProjectUpdate(
            name=new_name,
        ),
    )
    assert updated_annotation_project.name == new_name


async def test_can_update_project_description(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project can be updated."""
    new_description = "New Description"
    updated_annotation_project = await api.annotation_projects.update(
        session,
        annotation_project,
        schemas.AnnotationProjectUpdate(
            description=new_description,
        ),
    )
    assert updated_annotation_project.description == new_description


async def test_can_update_project_annotation_instructions(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project can be updated."""
    new_annotation_instructions = "New Annotation Instructions"
    updated_annotation_project = await api.annotation_projects.update(
        session,
        annotation_project,
        schemas.AnnotationProjectUpdate(
            annotation_instructions=new_annotation_instructions,
        ),
    )
    assert (
        updated_annotation_project.annotation_instructions
        == new_annotation_instructions
    )


async def test_update_modifies_database_values(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project can be updated."""
    new_name = "New Name"
    new_description = "New Description"
    new_annotation_instructions = "New Annotation Instructions"
    await api.annotation_projects.update(
        session,
        annotation_project,
        schemas.AnnotationProjectUpdate(
            name=new_name,
            description=new_description,
            annotation_instructions=new_annotation_instructions,
        ),
    )
    stmt = select(models.AnnotationProject).where(
        models.AnnotationProject.id == annotation_project.id
    )
    result = await session.execute(stmt)
    db_annotation_project = result.scalars().first()
    assert db_annotation_project is not None
    assert db_annotation_project.id == annotation_project.id
    assert db_annotation_project.name == new_name
    assert db_annotation_project.description == new_description
    assert (
        db_annotation_project.annotation_instructions
        == new_annotation_instructions
    )


async def test_delete_removes_project_from_database(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
):
    """Test that an annotation project can be deleted."""
    await api.annotation_projects.delete(
        session,
        annotation_project,
    )
    stmt = select(models.AnnotationProject).where(
        models.AnnotationProject.id == annotation_project.id
    )
    result = await session.execute(stmt)
    db_annotation_project = result.scalars().first()
    assert db_annotation_project is None


async def test_add_tag_to_project(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    tag: schemas.Tag,
):
    """Test that a tag can be added to an annotation project."""
    updated_annotation_project = await api.annotation_projects.add_tag(
        session,
        annotation_project,
        tag,
    )
    assert tag in updated_annotation_project.tags


async def test_add_tag_to_project_modifies_database(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    tag: schemas.Tag,
):
    """Test that a tag can be added to an annotation project."""
    await api.annotation_projects.add_tag(
        session,
        annotation_project,
        tag,
    )
    stmt = select(models.AnnotationProjectTag).where(
        models.AnnotationProjectTag.annotation_project_id
        == annotation_project.id,
        models.AnnotationProjectTag.tag_id == tag.id,
    )
    result = await session.execute(stmt)
    db_annotation_project_tag = result.scalars().first()
    assert db_annotation_project_tag is not None
    assert (
        db_annotation_project_tag.annotation_project_id
        == annotation_project.id
    )
    assert db_annotation_project_tag.tag_id == tag.id


async def test_add_tag_to_project_does_not_add_duplicate(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    tag: schemas.Tag,
):
    """Test that a tag cannot be added to an annotation project twice."""
    await api.annotation_projects.add_tag(
        session,
        annotation_project,
        tag,
    )
    with pytest.raises(exceptions.DuplicateObjectError):
        await api.annotation_projects.add_tag(session, annotation_project, tag)


async def test_remove_tag_from_project(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    tag: schemas.Tag,
):
    """Test that a tag can be removed from an annotation project."""
    annotation_project = await api.annotation_projects.add_tag(
        session,
        annotation_project,
        tag,
    )
    updated_annotation_project = await api.annotation_projects.remove_tag(
        session,
        annotation_project,
        tag,
    )
    assert tag not in updated_annotation_project.tags


async def test_remove_tag_from_project_modifies_database(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    tag: schemas.Tag,
):
    """Test that a tag can be removed from an annotation project."""
    annotation_project = await api.annotation_projects.add_tag(
        session,
        annotation_project,
        tag,
    )
    await api.annotation_projects.remove_tag(
        session,
        annotation_project,
        tag,
    )
    stmt = select(models.AnnotationProjectTag).where(
        models.AnnotationProjectTag.annotation_project_id
        == annotation_project.id,
        models.AnnotationProjectTag.tag_id == tag.id,
    )
    result = await session.execute(stmt)
    db_annotation_project_tag = result.scalars().first()
    assert db_annotation_project_tag is None


async def test_remove_tag_from_project_fails_if_tag_not_present(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    tag: schemas.Tag,
):
    """Test that a tag can be removed from an annotation project."""
    with pytest.raises(exceptions.NotFoundError):
        await api.annotation_projects.remove_tag(
            session, annotation_project, tag
        )
