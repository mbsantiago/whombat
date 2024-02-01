"""Common fixtures for Whombat tests.""" ""
import logging
import os
import random
import shutil
import string
from collections.abc import Callable
from pathlib import Path
from typing import AsyncGenerator, Optional

import numpy as np
import pytest
import soundevent
import soundfile as sf
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, cache, schemas
from whombat.system import get_database_url, init_database
from whombat.system.settings import Settings

# Avoid noisy logging during tests.
logging.getLogger("aiosqlite").setLevel(logging.WARNING)
logging.getLogger("asyncio").setLevel(logging.WARNING)
logging.getLogger("passlib").setLevel(logging.WARNING)


@pytest.fixture
def data_dir() -> Path:
    """Return the path to the data directory."""
    return Path(__file__).parent / "data"


@pytest.fixture(autouse=True)
def clear_api_cache() -> None:
    """Clear the api cache before each test."""
    api.users._cache.clear()
    api.notes._cache.clear()
    api.tags._cache.clear()
    api.features._cache.clear()
    api.recordings._cache.clear()
    api.datasets._cache.clear()
    api.sound_events._cache.clear()
    api.clips._cache.clear()
    api.sound_event_annotations._cache.clear()
    api.clip_annotations._cache.clear()
    api.annotation_tasks._cache.clear()
    api.annotation_projects._cache.clear()
    api.sound_event_predictions._cache.clear()
    api.clip_predictions._cache.clear()
    api.model_runs._cache.clear()
    api.user_runs._cache.clear()
    api.evaluations._cache.clear()
    api.clip_evaluations._cache.clear()
    api.sound_event_evaluations._cache.clear()
    api.evaluation_sets._cache.clear()


@pytest.fixture
def audio_dir(tmp_path: Path):
    """Fixture to create a temporary audio directory."""
    path = tmp_path / "audio"
    path.mkdir(parents=True, exist_ok=True)
    return path


@pytest.fixture(scope="session")
async def database_template(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """Create a database template for testing."""
    tmp_path = tmp_path_factory.mktemp("template")
    db_path = tmp_path / "template.db"
    settings = Settings(
        db_dialect="sqlite",
        db_name=str(db_path),
        audio_dir=tmp_path / "audio",
    )
    await init_database(settings)
    return db_path


@pytest.fixture
def database_path(tmp_path: Path, database_template: Path) -> Path:
    """Create a database for testing.

    Copies the database template to a temporary location.
    """
    path = tmp_path / "test.db"
    shutil.copy(database_template, path)
    return path


@pytest.fixture(autouse=True)
def settings(
    audio_dir: Path,
    database_path: Path,
) -> Settings:
    """Fixture to return the settings."""
    return Settings(
        db_dialect="sqlite",
        db_name=str(database_path),
        audio_dir=audio_dir,
        open_on_startup=False,
        log_to_file=False,
        log_to_stdout=True,
    )


@pytest.fixture
def database_url(settings: Settings) -> URL:
    """Fixture to return the database url."""
    return get_database_url(settings)


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
    bit_depth: int = 16,
) -> None:
    """Write a random wav file to disk."""
    frames = int(samplerate * duration)
    shape = (frames, channels)
    wav = np.random.random(size=shape).astype(np.float32)

    sub_type = "PCM_16"
    if bit_depth == 16:
        sub_type = "PCM_16"
    elif bit_depth == 32:
        sub_type = "PCM_32"
    elif bit_depth == 24:
        sub_type = "PCM_24"
    elif bit_depth == 8:
        sub_type = "PCM_S8"
    else:
        raise ValueError("Unsupported bit depth.")

    sf.write(path, wav, samplerate, subtype=sub_type)


@pytest.fixture
def random_wav_factory(audio_dir: Path):
    """Produce a random wav file."""

    def wav_factory(
        path: Optional[Path] = None,
        samplerate: int = 22100,
        duration: float = 0.1,
        channels: int = 1,
        bit_depth: int = 16,
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
            bit_depth=bit_depth,
        )

        return path

    return wav_factory


@pytest.fixture
async def session(
    database_url: URL,
) -> AsyncGenerator[AsyncSession, None]:
    """Create a session that uses an in-memory database."""
    async with api.create_session(db_url=database_url) as sess:
        yield sess


@pytest.fixture
async def user(session: AsyncSession) -> schemas.SimpleUser:
    """Create a user for tests."""
    user = await api.users.create(
        session,
        username="test",
        password="password",
        email="test@whombat.com",
        is_active=True,
    )
    await session.commit()
    return user


@pytest.fixture
async def tag(session: AsyncSession) -> schemas.Tag:
    """Create a tag for testing."""
    return await api.tags.create(
        session,
        key="test_key",
        value="test_value",
    )


@pytest.fixture
async def feature_name(session: AsyncSession) -> schemas.FeatureName:
    """Create a feature for testing."""
    return await api.features.create(session, name="test_feature")


@pytest.fixture
def feature(feature_name: schemas.FeatureName) -> schemas.Feature:
    """Create a feature for testing."""
    return schemas.Feature(name=feature_name.name, value=0.5)


@pytest.fixture
async def note(
    session: AsyncSession,
    user: schemas.SimpleUser,
) -> schemas.Note:
    """Create a note for testing."""
    note = await api.notes.create(
        session,
        message="test_message",
        created_by=user,
    )
    return note


@pytest.fixture
async def recording(
    session: AsyncSession,
    random_wav_factory: Callable[..., Path],
    audio_dir: Path,
) -> schemas.Recording:
    """Create a recording for testing."""
    return await api.recordings.create(
        session,
        path=random_wav_factory(),
        audio_dir=audio_dir,
    )


@pytest.fixture
async def clip(
    session: AsyncSession,
    recording: schemas.Recording,
) -> schemas.Clip:
    """Create a clip for testing."""
    return await api.clips.create(
        session,
        recording=recording,
        start_time=0.1,
        end_time=0.2,
    )


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
    return await api.sound_events.create(
        session,
        recording=recording,
        geometry=geometry,
    )


@pytest.fixture
async def dataset(session: AsyncSession, audio_dir: Path) -> schemas.Dataset:
    """Create a dataset for testing."""
    dataset_dir = audio_dir / "test_dataset" / "audio"
    dataset_dir.mkdir(parents=True)
    return await api.datasets.create(
        session,
        name="test_dataset",
        description="test_description",
        dataset_dir=dataset_dir,
        audio_dir=audio_dir,
    )


@pytest.fixture
async def clip_annotation(
    session: AsyncSession,
    clip: schemas.Clip,
) -> schemas.ClipAnnotation:
    """Create a clip annotation for testing."""
    ann = await api.clip_annotations.create(
        session,
        clip=clip,
    )
    await session.commit()
    return ann


@pytest.fixture
async def sound_event_annotation(
    session: AsyncSession,
    clip_annotation: schemas.ClipAnnotation,
    sound_event: schemas.SoundEvent,
    user: schemas.SimpleUser,
) -> schemas.SoundEventAnnotation:
    """Create a sound event annotation for testing."""
    return await api.sound_event_annotations.create(
        session,
        clip_annotation=clip_annotation,
        sound_event=sound_event,
        created_by=user,
    )


@pytest.fixture
async def annotation_project(
    session: AsyncSession,
) -> schemas.AnnotationProject:
    """Create an annotation project for testing."""
    return await api.annotation_projects.create(
        session,
        name="test_annotation_project",
        description="test_description",
        annotation_instructions="test_instructions",
    )


@pytest.fixture
async def annotation_task(
    session: AsyncSession,
    annotation_project: schemas.AnnotationProject,
    clip: schemas.Clip,
) -> schemas.AnnotationTask:
    """Create a task for testing."""
    return await api.annotation_tasks.create(
        session,
        annotation_project=annotation_project,
        clip=clip,
    )


@pytest.fixture
async def clip_prediction(
    session: AsyncSession,
    clip: schemas.Clip,
) -> schemas.ClipPrediction:
    """Create a clip prediction for testing."""
    return await api.clip_predictions.create(
        session,
        clip=clip,
    )


@pytest.fixture
async def sound_event_prediction(
    session: AsyncSession,
    sound_event: schemas.SoundEvent,
    clip_prediction: schemas.ClipPrediction,
) -> schemas.SoundEventPrediction:
    """Create a sound event prediction for testing."""
    return await api.sound_event_predictions.create(
        session,
        clip_prediction=clip_prediction,
        sound_event=sound_event,
        score=0.5,
    )


@pytest.fixture
async def model_run(
    session: AsyncSession,
) -> schemas.ModelRun:
    """Create a model run for testing."""
    return await api.model_runs.create(
        session,
        name="test_model",
        version="0.0.0",
        description="test_description",
    )


@pytest.fixture
async def user_run(
    session: AsyncSession,
    user: schemas.SimpleUser,
) -> schemas.UserRun:
    """Create a user run for testing."""
    return await api.user_runs.create(
        session,
        user=user,
    )


@pytest.fixture
async def evaluation(
    session: AsyncSession,
) -> schemas.Evaluation:
    """Create an evaluation for testing."""
    return await api.evaluations.create(
        session,
        score=0.5,
        task="clip_classification",
    )


@pytest.fixture
async def clip_evaluation(
    session: AsyncSession,
    evaluation: schemas.Evaluation,
    clip_prediction: schemas.ClipPrediction,
    clip_annotation: schemas.ClipAnnotation,
) -> schemas.ClipEvaluation:
    """Create a clip evaluation for testing."""
    return await api.clip_evaluations.create(
        session,
        evaluation=evaluation,
        clip_prediction=clip_prediction,
        clip_annotation=clip_annotation,
        score=0.7,
    )


@pytest.fixture
async def sound_event_evaluation(
    session: AsyncSession,
    clip_evaluation: schemas.ClipEvaluation,
    sound_event_prediction: schemas.SoundEventPrediction,
    sound_event_annotation: schemas.SoundEventAnnotation,
) -> schemas.SoundEventEvaluation:
    """Create a sound event evaluation for testing."""
    return await api.sound_event_evaluations.create(
        session,
        clip_evaluation=clip_evaluation,
        source=sound_event_prediction,
        target=sound_event_annotation,
        affinity=1,
        score=0.7,
    )


@pytest.fixture
async def evaluation_set(
    session: AsyncSession,
) -> schemas.EvaluationSet:
    """Create an evaluation set for testing."""
    return await api.evaluation_sets.create(
        session,
        name="test_evaluation_set",
        description="test_description",
    )
