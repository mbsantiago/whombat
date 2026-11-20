"""Pure project-to-ZIP export logic."""

import csv
import hashlib
import io
import json
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from uuid import UUID

import numpy as np
import soundfile as sf
import xarray as xr
import yaml
from soundevent import audio
from soundevent.data import AnnotationState
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from whombat import models
from whombat.core.files import resolve_within_root

COLUMNS = [
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
TARGET_RATE = 16_000
TARGET_SAMPLES = 15_360
COMPLETED_STATES = {AnnotationState.completed, AnnotationState.verified}


@dataclass
class ExportResult:
    zip_bytes: bytes
    report: dict


def load_profile(path: Path | None = None) -> dict:
    """Load category IDs and tag-key mapping from JSON or YAML."""
    path = path or Path(__file__).with_name("categories.yaml")
    text = path.read_text(encoding="utf-8")
    profile = (
        json.loads(text)
        if path.suffix.lower() == ".json"
        else yaml.safe_load(text)
    )
    categories = profile["categories"]
    profile["category_ids"] = [item["id"] for item in categories]
    profile["tag_key_to_category"] = {
        key: item["id"]
        for item in categories
        for key in item.get("tag_keys", [])
    }
    return profile


async def build_export(
    session: AsyncSession,
    audio_root: Path,
    project_uuid: UUID,
    profile: dict,
    completed_only: bool = True,
) -> ExportResult:
    """Build the dataset archive and its integrity report.

    By default only tasks carrying a completed or verified status badge are
    exported; pass ``completed_only=False`` to export every task in the
    project.
    """
    project_id = await session.scalar(
        select(models.AnnotationProject.id).where(
            models.AnnotationProject.uuid == project_uuid
        )
    )
    task_stmt = (
        select(models.AnnotationTask)
        .where(models.AnnotationTask.annotation_project_id == project_id)
        .options(
            selectinload(models.AnnotationTask.clip).selectinload(
                models.Clip.recording
            ),
            selectinload(models.AnnotationTask.clip_annotation)
            .selectinload(models.ClipAnnotation.sound_events)
            .selectinload(models.SoundEventAnnotation.tags),
            selectinload(models.AnnotationTask.status_badges),
        )
    )
    all_tasks = (await session.execute(task_stmt)).unique().scalars().all()
    tasks = (
        [
            task
            for task in all_tasks
            if any(
                badge.state in COMPLETED_STATES for badge in task.status_badges
            )
        ]
        if completed_only
        else all_tasks
    )
    category_order = list(profile["category_ids"])
    tag_map = profile["tag_key_to_category"]
    category_counts: Counter = Counter()
    session_categories: dict[str, set[str]] = defaultdict(set)
    skipped = Counter()
    archive = io.BytesIO()

    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zipped:
        csv_bytes = io.StringIO(newline="")
        writer = csv.DictWriter(csv_bytes, fieldnames=COLUMNS)
        writer.writeheader()
        for task in tasks:
            clip = task.clip
            recording = clip.recording
            annotations = (
                task.clip_annotation.sound_events
                if task.clip_annotation
                else []
            )
            if not annotations:
                categories = ["background"]
            else:
                mapped = {
                    tag_map[tag.key]
                    for event in annotations
                    for tag in event.tags
                    if tag.key in tag_map
                }
                categories = [
                    category
                    for category in category_order
                    if category in mapped
                ]
                if not categories:
                    skipped["unmapped_tags"] += 1
                    continue
                if len(categories) > 1:
                    # One clip UUID must occur once; declared profile order resolves multi-category conflicts.
                    skipped["category_conflicts"] += 1
                    categories = categories[:1]
            source = Path(recording.path).name
            try:
                path = resolve_within_root(
                    audio_root / recording.path, audio_root
                )
                with sf.SoundFile(path) as audio_file:
                    source_wave = audio_file.read(
                        dtype="float32", always_2d=True
                    )
                    source_rate = audio_file.samplerate
                wave = source_wave[
                    int(clip.start_time * source_rate) : int(
                        clip.end_time * source_rate
                    )
                ].mean(axis=1)
                if not len(wave):
                    skipped["no_geometry"] += 1
                    continue
                wave = xr.DataArray(
                    wave,
                    dims=("time",),
                    coords={"time": np.arange(len(wave)) / source_rate},
                    attrs={"samplerate": source_rate},
                )
                wave = audio.resample(wave, TARGET_RATE).values
                wave = wave[:TARGET_SAMPLES]
                if len(wave) < TARGET_SAMPLES:
                    wave = np.pad(wave, (0, TARGET_SAMPLES - len(wave)))
                wav = io.BytesIO()
                sf.write(
                    wav, wave, TARGET_RATE, format="WAV", subtype="PCM_16"
                )
                wav_bytes = wav.getvalue()
            except (OSError, RuntimeError, ValueError):
                skipped["unreadable_audio"] += 1
                continue

            clip_id = str(clip.uuid)
            session_id = str(recording.uuid)
            file_path = f"data/raw/{categories[0]}/{clip_id}.wav"
            zipped.writestr(file_path, wav_bytes)
            with sf.SoundFile(io.BytesIO(wav_bytes)) as output:
                duration, rate, channels = (
                    output.frames / output.samplerate,
                    output.samplerate,
                    output.channels,
                )
            writer.writerow(
                {
                    "recording_id": clip_id,
                    "file_path": file_path,
                    "source_filename": source,
                    "sha256": hashlib.sha256(wav_bytes).hexdigest(),
                    "category_id": categories[0],
                    "subcategory": "",
                    "session_id": session_id,
                    "microphone_id": "",
                    "environment": "",
                    "notes": "",
                    "duration_seconds": duration,
                    "sample_rate": rate,
                    "channels": channels,
                    "validation_status": "unknown",
                }
            )
            category_counts[categories[0]] += 1
            session_categories[session_id].add(categories[0])
        zipped.writestr(
            "audio_manifest.csv", csv_bytes.getvalue().encode("utf-8")
        )

    report = {
        "categories": category_order,
        "all_emitted_categories_valid": all(
            category in category_order for category in category_counts
        ),
        "per_category_clip_counts": {
            category: category_counts[category] for category in category_order
        },
        "categories_below_three_clips": [
            category
            for category in category_order
            if category_counts[category] < 3
        ],
        "sessions_spanning_multiple_categories": sorted(
            key for key, value in session_categories.items() if len(value) > 1
        ),
        "skipped_clips": {
            "no_geometry": skipped["no_geometry"],
            "unmapped_tags": skipped["unmapped_tags"],
            "unreadable_audio": skipped["unreadable_audio"],
            "category_conflicts": skipped["category_conflicts"],
        },
        "tasks_total": len(all_tasks),
        "tasks_exported": len(tasks),
        "tasks_filtered_out": len(all_tasks) - len(tasks),
        "task_completion_filtering": (
            "Only tasks with a completed or verified status badge are "
            "exported."
            if completed_only
            else "All project tasks are exported; no completion filter applied."
        ),
    }
    return ExportResult(archive.getvalue(), report)
