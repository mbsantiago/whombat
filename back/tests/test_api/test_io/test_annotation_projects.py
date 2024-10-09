from collections.abc import Awaitable, Callable
from pathlib import Path

from soundevent.io.aoef import to_aeof
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, filters, schemas
from whombat.api.io.aoef.annotation_projects import import_annotation_project
from whombat.api.io.aoef.datasets import import_dataset


async def test_exports_annotation_tags(
    annotation_project: schemas.AnnotationProject,
    tag_factory: Callable[..., Awaitable[schemas.Tag]],
    session: AsyncSession,
) -> None:
    tags = [
        await tag_factory(key="key1", value="value1"),
        await tag_factory(key="key2", value="value2"),
    ]

    annotation_project = await api.annotation_projects.add_tag(
        session,
        annotation_project,
        tags[0],
    )
    annotation_project = await api.annotation_projects.add_tag(
        session,
        annotation_project,
        tags[1],
    )

    assert len(annotation_project.tags) == 2

    converted = await api.annotation_projects.to_soundevent(
        session,
        annotation_project,
    )

    assert len(converted.annotation_tags) == 2
    assert converted.annotation_tags[0].key == "key1"
    assert converted.annotation_tags[0].value == "value1"

    assert converted.annotation_tags[1].key == "key2"
    assert converted.annotation_tags[1].value == "value2"

    obj = to_aeof(converted)
    assert obj.data is not None
    assert len(obj.data.project_tags or []) == 2  # type: ignore


async def test_can_export_clip_notes(
    annotation_project: schemas.AnnotationProject,
    clip_annotation: schemas.ClipAnnotation,
    session: AsyncSession,
):
    note = await api.notes.create(session, "Test note")
    clip_annotation = await api.clip_annotations.add_note(
        session,
        clip_annotation,
        note,
    )

    assert len(clip_annotation.notes) == 1

    await api.annotation_tasks.create(
        session,
        annotation_project,
        clip_annotation.clip,
        clip_annotation_id=clip_annotation.id,
    )

    converted = await api.annotation_projects.to_soundevent(
        session,
        annotation_project,
    )

    assert len(converted.tasks) == 1
    assert len(converted.clip_annotations) == 1
    assert len(converted.clip_annotations[0].notes) == 1


async def test_can_import_example_annotation_project(
    session: AsyncSession,
    example_dataset_path: Path,
    example_audio_dir: Path,
    example_annotation_project_path: Path,
):
    await import_dataset(
        session,
        example_dataset_path,
        dataset_dir=example_audio_dir,
        audio_dir=example_audio_dir,
    )

    db_project = await import_annotation_project(
        session,
        example_annotation_project_path,
        audio_dir=example_audio_dir,
        base_audio_dir=example_audio_dir,
    )

    project = await api.annotation_projects.get(session, db_project.uuid)

    # Has the correct number of annotation tags
    assert len(project.tags) == 11

    # Has the correct number of clip annotation notes
    _, count = await api.notes.get_sound_event_annotation_notes(
        session,
        limit=0,
        filters=[
            filters.SoundEventAnnotationNoteFilter.model_validate(
                dict(annotation_project=dict(eq=project.uuid))
            )
        ],
    )
    assert count == 4

    # Has the correct number of sound event annotation notes
    _, count = await api.notes.get_clip_annotation_notes(
        session,
        limit=0,
        filters=[
            filters.ClipAnnotationNoteFilter.model_validate(
                dict(annotation_project=dict(eq=project.uuid))
            )
        ],
    )
    assert count == 3
