"""Tests for the audio-recognizer-vandalism export plugin."""

import csv
import hashlib
import io
import zipfile

import pytest
import soundfile as sf
from soundevent.data import AnnotationState

from whombat_tflm_export import build_export, load_profile

from whombat import api
from whombat.plugins import load_plugins
from whombat.system import create_app

HEADER = [
    "recording_id",
    "file_path",
    "source_filename",
    "sha256",
    "category_id",
    "subcategory",
    "session_id",
    "microphone_id",
    "environment",
    "notes",
    "duration_seconds",
    "sample_rate",
    "channels",
    "validation_status",
]


@pytest.fixture
async def recording(session, random_wav_factory, audio_dir):
    """Return a recording long enough to contain the 0.1-0.2 s clip."""
    rec = await api.recordings.create(
        session,
        path=random_wav_factory(duration=1.0),
        audio_dir=audio_dir,
    )
    await session.commit()
    return rec


async def mark_completed(session, task):
    """Attach a completed status badge and persist it."""
    await api.annotation_tasks.add_status_badge(
        session, task, AnnotationState.completed
    )
    await session.commit()


def read_rows(result) -> list[dict]:
    """Read the manifest rows back out of the exported archive."""
    with zipfile.ZipFile(io.BytesIO(result.zip_bytes)) as archive:
        return list(
            csv.DictReader(
                io.StringIO(archive.read("audio_manifest.csv").decode())
            )
        )


def test_plugin_is_discovered():
    """The plugin must be importable by name and found by the loader."""
    names = {name for name, _ in load_plugins()}
    assert "tflm_export" in names


async def test_export_manifest_audio_and_report(
    session,
    audio_dir,
    annotation_project,
    annotation_task,
    clip,
    sound_event_annotation,
    recording,
    tag_factory,
    settings,
):
    tag = await tag_factory("drill", "impact")
    await api.sound_event_annotations.add_tag(
        session, sound_event_annotation, tag
    )
    await mark_completed(session, annotation_task)

    result = await build_export(
        session, audio_dir, annotation_project.uuid, load_profile()
    )

    assert result.report["skipped_clips"] == {
        "no_geometry": 0,
        "unmapped_tags": 0,
        "unreadable_audio": 0,
        "category_conflicts": 0,
    }
    assert result.report["tasks_total"] == 1
    assert result.report["tasks_exported"] == 1

    with zipfile.ZipFile(io.BytesIO(result.zip_bytes)) as archive:
        rows = list(
            csv.DictReader(
                io.StringIO(archive.read("audio_manifest.csv").decode())
            )
        )
        assert list(rows[0]) == HEADER
        assert rows[0]["session_id"] == str(recording.uuid)
        assert rows[0]["recording_id"] == str(clip.uuid)
        assert rows[0]["file_path"] == f"data/raw/drill/{clip.uuid}.wav"

        audio_bytes = archive.read(rows[0]["file_path"])
        assert rows[0]["sha256"] == hashlib.sha256(audio_bytes).hexdigest()
        with sf.SoundFile(io.BytesIO(audio_bytes)) as wav:
            assert wav.samplerate == 16_000
            assert wav.channels == 1
            assert wav.frames == 15_360
            samples = wav.read(dtype="float32")

        # A silent clip means the geometry was sliced past the end of the
        # audio, which the previous implementation hid by zero-padding.
        assert abs(samples).max() > 0

    assert "drill" in result.report["categories_below_three_clips"]
    assert create_app(settings)


async def test_unannotated_clip_is_background(
    session,
    audio_dir,
    annotation_project,
    annotation_task,
):
    await mark_completed(session, annotation_task)

    result = await build_export(
        session, audio_dir, annotation_project.uuid, load_profile()
    )

    rows = read_rows(result)
    assert rows[0]["category_id"] == "background"


async def test_unmapped_tag_is_counted(
    session,
    audio_dir,
    annotation_project,
    annotation_task,
    sound_event_annotation,
    tag_factory,
):
    tag = await tag_factory("not_mapped", "value")
    await api.sound_event_annotations.add_tag(
        session, sound_event_annotation, tag
    )
    await mark_completed(session, annotation_task)

    result = await build_export(
        session, audio_dir, annotation_project.uuid, load_profile()
    )

    assert read_rows(result) == []
    assert result.report["skipped_clips"]["unmapped_tags"] == 1


async def test_incomplete_task_is_filtered_out_by_default(
    session,
    audio_dir,
    annotation_project,
    annotation_task,
):
    result = await build_export(
        session, audio_dir, annotation_project.uuid, load_profile()
    )

    assert read_rows(result) == []
    assert result.report["tasks_total"] == 1
    assert result.report["tasks_exported"] == 0
    assert result.report["tasks_filtered_out"] == 1


async def test_completed_filter_can_be_disabled(
    session,
    audio_dir,
    annotation_project,
    annotation_task,
):
    result = await build_export(
        session,
        audio_dir,
        annotation_project.uuid,
        load_profile(),
        completed_only=False,
    )

    rows = read_rows(result)
    assert len(rows) == 1, result.report
    assert result.report["tasks_filtered_out"] == 0
