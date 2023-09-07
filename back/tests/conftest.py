"""Common fixtures for Whombat tests.""" ""
import logging
import os
import random
import string
from collections.abc import Callable
from pathlib import Path
from typing import AsyncGenerator, Optional

import numpy as np
import pytest
import soundevent
from scipy.io import wavfile
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, cache, dependencies, models, schemas
from whombat.app import app
from whombat.settings import Settings

# Avoid noisy logging during tests.
logging.getLogger("aiosqlite").setLevel(logging.WARNING)
logging.getLogger("asyncio").setLevel(logging.WARNING)
logging.getLogger("passlib").setLevel(logging.WARNING)


@pytest.fixture
def audio_dir(tmp_path: Path):
    """Fixture to create a temporary audio directory."""
    path = tmp_path / "audio"
    path.mkdir(parents=True, exist_ok=True)
    return path


@pytest.fixture
def database_test(tmp_path: Path) -> Path:
    """Fixture to create a temporary database."""
    return tmp_path / "test.db"


@pytest.fixture(autouse=True)
def settings(database_test: Path) -> Settings:
    """Fixture to return the settings."""
    os.environ["db_url"] = f"sqlite+aiosqlite:///{database_test.absolute()}"
    os.environ["audio_dir"] = "/"
    os.environ["app_name"] = "Whombat"
    os.environ["admin_username"] = "test_admin"
    os.environ["admin_password"] = "test_password"
    os.environ["admin_email"] = "test@whombat.com"
    settings = Settings(
        db_url=f"sqlite+aiosqlite:///{database_test.absolute()}",
        app_name="Whombat",
        audio_dir=Path("/"),
        admin_username="test_admin",
        admin_password="test_password",
        admin_email="test@whombat.com",
    )
    app.dependency_overrides[dependencies.get_settings] = lambda: settings
    return settings


@pytest.fixture(autouse=True)
async def clear_cache():
    """Clear the cache before each test."""
    cache.clear_all_caches()
    yield


def random_string():
    """Generate a random string of fixed length."""
    options = string.ascii_uppercase + string.digits
    return "".join(random.choice(options) for _ in range(10))


def write_random_wav(
    path: Path,
    samplerate: int = 22100,
    duration: float = 0.1,
    channels: int = 1,
) -> None:
    """Write a random wav file to disk."""
    frames = int(samplerate * duration)
    shape = (frames, channels)
    wav = np.random.random(size=shape).astype(np.float32)
    wavfile.write(path, samplerate, wav)


@pytest.fixture
def random_wav_factory(audio_dir: Path):
    """Produce a random wav file."""

    def wav_factory(
        path: Optional[Path] = None,
        samplerate: int = 22100,
        duration: float = 0.1,
        channels: int = 1,
    ) -> Path:
        if path is None:
            path = audio_dir / (random_string() + ".wav")

        dirname = os.path.dirname(path)
        if not os.path.exists(dirname):
            os.makedirs(dirname)

        write_random_wav(
            path=path,
            samplerate=samplerate,
            duration=duration,
            channels=channels,
        )

        return path

    return wav_factory


@pytest.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    """Create a session that uses an in-memory database."""
    async with api.sessions.create() as sess:
        yield sess


@pytest.fixture
async def user(session: AsyncSession) -> schemas.User:
    """Create a user for tests."""
    user = await api.users.create(
        session,
        data=schemas.UserCreate(
            username="test",
            password="test",
            email="test@whombat.com",
        ),
    )
    return user


@pytest.fixture
async def recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
) -> schemas.Recording:
    """Create a recording for testing."""
    recording = await api.recordings.create(
        session,
        data=schemas.RecordingCreate(path=random_wav_factory()),
        audio_dir=audio_dir,
    )
    return recording


@pytest.fixture
async def tag(session: AsyncSession) -> schemas.Tag:
    """Create a tag for testing."""
    tag = await api.tags.create(
        session,
        data=schemas.TagCreate(key="test_key", value="test_value"),
    )
    return tag


@pytest.fixture
async def feature_name(session: AsyncSession) -> schemas.FeatureName:
    """Create a feature for testing."""
    feature_name = await api.features.create(
        session, data=schemas.FeatureNameCreate(name="test_feature")
    )
    return feature_name


@pytest.fixture
async def note(session: AsyncSession, user: schemas.User) -> schemas.Note:
    """Create a note for testing."""
    note = await api.notes.create(
        session,
        data=schemas.NotePostCreate(
            message="test_message",
            created_by_id=user.id,
        ),
    )
    return note


@pytest.fixture
async def clip(
    session: AsyncSession,
    recording: schemas.Recording,
) -> schemas.Clip:
    """Create a clip for testing."""
    return await api.clips.create(
        session,
        data=schemas.ClipCreate(
            recording_id=recording.id,
            start_time=0.1,
            end_time=0.2,
        ),
    )


@pytest.fixture
async def dataset(session: AsyncSession, audio_dir: Path) -> schemas.Dataset:
    """Create a dataset for testing."""
    dataset_dir = audio_dir / "test_dataset" / "audio"
    dataset_dir.mkdir(parents=True)
    dataset, _ = await api.datasets.create(
        session,
        data=schemas.DatasetCreate(
            name="test_dataset",
            description="test_description",
            audio_dir=dataset_dir,
        ),
        audio_dir=audio_dir,
    )
    return dataset


@pytest.fixture
async def annotation_project(
    session: AsyncSession,
) -> schemas.AnnotationProject:
    """Create an annotation project for testing."""
    annotation_project = await api.annotation_projects.create(
        session,
        data=schemas.AnnotationProjectCreate(
            name="test_annotation_project",
            description="test_description",
            annotation_instructions="test_instructions",
        ),
    )
    return annotation_project


@pytest.fixture
async def task(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
) -> schemas.Task:
    """Create a task for testing."""
    task = await api.tasks.create(
        session,
        data=schemas.TaskCreate(
            project_id=annotation_project.id,
            clip_id=clip.id,
        ),
    )
    return task


@pytest.fixture
async def task_status_badge(
    session: AsyncSession,
    task: schemas.Task,
    user: schemas.User,
) -> schemas.TaskStatusBadge:
    """Create a task status badge for testing."""
    task = await api.tasks.add_status_badge(
        session,
        task_id=task.id,
        user_id=user.id,
        state=models.TaskState.assigned,
    )
    task_status_badge = next(
        badge
        for badge in task.status_badges
        if badge.user_id == user.id
        and badge.state == models.TaskState.assigned
    )
    return task_status_badge


@pytest.fixture
async def task_tag(
    session: AsyncSession,
    task: schemas.Task,
    tag: schemas.Tag,
    user: schemas.User,
) -> schemas.TaskTag:
    """Create a task tag for testing."""
    task = await api.tasks.add_tag(
        session,
        task_id=task.id,
        tag_id=tag.id,
        created_by_id=user.id,
    )
    task_tag = next(
        tag
        for tag in task.tags
        if tag.tag_id == tag.id and tag.created_by_id == user.id
    )
    return task_tag


@pytest.fixture
async def sound_event(
    session: AsyncSession,
    recording: schemas.Recording,
) -> schemas.SoundEvent:
    """Create a sound event for testing."""
    geometry = soundevent.Polygon(
        coordinates=[
            [
                [0.0, 0.0],
                [0.0, 1.0],
                [1.0, 1.0],
                [1.0, 0.0],
            ]
        ]
    )

    sound_event = await api.sound_events.create(
        session,
        data=schemas.SoundEventCreate(
            recording_id=recording.id,
            geometry=geometry,
        ),
    )
    return sound_event


@pytest.fixture
async def annotation(
    session: AsyncSession,
    task: schemas.Task,
    sound_event: schemas.SoundEvent,
    user: schemas.User,
) -> schemas.Annotation:
    """Create an annotation for testing."""
    annotation = await api.annotations.create(
        session,
        data=schemas.AnnotationCreate(
            created_by_id=user.id,
            task_id=task.id,
            sound_event_id=sound_event.id,
        ),
    )
    return annotation
