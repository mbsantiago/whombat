"""Helper that writes a real export archive when asked for one.

Skipped unless WHOMBAT_EXPORT_OUT points at an output file. Used to check the
export against the training repository's own validator.
"""

import os
import uuid
from pathlib import Path

import numpy as np
import pytest
import soundevent
import soundfile as sf
from soundevent.data import AnnotationState

from whombat_tflm_export import build_export, load_profile

from whombat import api

CATEGORIES = {
    "drill": "drill",
    "spray": "spray",
    "door": "door",
    "background": None,
}
# create_splits groups by session and holds out 30% of groups for validation and
# test, so every category needs at least four recordings with four classes.
RECORDINGS_PER_CATEGORY = 4
CLIPS_PER_RECORDING = 2


def write_source_wav(audio_dir: Path) -> Path:
    """Write a 5 second source recording at a realistic level."""
    samplerate = 22_100
    samples = np.random.uniform(-0.5, 0.5, samplerate * 5).astype("float32")
    path = audio_dir / f"{uuid.uuid4()}.wav"
    sf.write(path, samples, samplerate, subtype="PCM_16")
    return path


@pytest.mark.skipif(
    not os.environ.get("WHOMBAT_EXPORT_OUT"),
    reason="WHOMBAT_EXPORT_OUT is not set",
)
async def test_write_export_artifact(
    session,
    audio_dir,
    annotation_project,
    user,
    tag_factory,
):
    for category_id, tag_key in CATEGORIES.items():
        tag = (
            await tag_factory(tag_key, category_id)
            if tag_key is not None
            else None
        )
        for _ in range(RECORDINGS_PER_CATEGORY):
            recording = await api.recordings.create(
                session,
                path=write_source_wav(audio_dir),
                audio_dir=audio_dir,
            )
            for index in range(CLIPS_PER_RECORDING):
                start = index * 1.0
                end = start + 0.96
                clip = await api.clips.create(
                    session,
                    recording=recording,
                    start_time=start,
                    end_time=end,
                )
                clip_annotation = await api.clip_annotations.create(
                    session, clip=clip
                )
                if tag_key is not None:
                    geometry = soundevent.Polygon(
                        coordinates=[
                            [
                                [start, 0.0],
                                [start, 1.0],
                                [end, 1.0],
                                [end, 0.0],
                            ]
                        ]
                    )
                    sound_event = await api.sound_events.create(
                        session, recording=recording, geometry=geometry
                    )
                    annotation = await api.sound_event_annotations.create(
                        session,
                        clip_annotation=clip_annotation,
                        sound_event=sound_event,
                        created_by=user,
                    )
                    assert tag is not None
                    await api.sound_event_annotations.add_tag(
                        session, annotation, tag
                    )
                task = await api.annotation_tasks.create(
                    session,
                    annotation_project=annotation_project,
                    clip=clip,
                    clip_annotation_id=clip_annotation.id,
                )
                await api.annotation_tasks.add_status_badge(
                    session, task, AnnotationState.completed
                )
            await session.commit()

    result = await build_export(
        session, audio_dir, annotation_project.uuid, load_profile()
    )
    Path(os.environ["WHOMBAT_EXPORT_OUT"]).write_bytes(result.zip_bytes)
    print("EXPORT_REPORT", result.report)
