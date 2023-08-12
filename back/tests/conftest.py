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
from scipy.io import wavfile
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import api, schemas

logging.getLogger("aiosqlite").setLevel(logging.WARNING)
logging.getLogger("asyncio").setLevel(logging.WARNING)


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
def random_wav_factory(tmp_path: Path):
    """Produce a random wav file."""

    def wav_factory(
        path: Optional[Path] = None,
        samplerate: int = 22100,
        duration: float = 0.1,
        channels: int = 1,
    ) -> Path:
        if path is None:
            path = tmp_path / (random_string() + ".wav")

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
    async with api.sessions.create_session() as sess:
        yield sess


@pytest.fixture
async def user(session: AsyncSession) -> schemas.User:
    """Create a user for tests."""
    user = await api.users.create_user(
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
) -> schemas.Recording:
    """Create a recording for testing."""
    recording = await api.recordings.create_recording(
        session,
        data=schemas.RecordingCreate(path=random_wav_factory()),
    )
    return recording


@pytest.fixture
async def tag(session: AsyncSession) -> schemas.Tag:
    """Create a tag for testing."""
    tag = await api.tags.create_tag(
        session,
        data=schemas.TagCreate(key="test_key", value="test_value"),
    )
    return tag


@pytest.fixture
async def feature(session: AsyncSession) -> schemas.Feature:
    """Create a feature for testing."""
    feature = await api.features.get_or_create_feature(
        session,
        name="test_feature",
        value=10,
    )
    return feature


@pytest.fixture
async def note(session: AsyncSession, user: schemas.User) -> schemas.Note:
    """Create a note for testing."""
    note = await api.notes.create_note(
        session,
        data=schemas.NoteCreate(
            message="test_message",
            created_by_id=user.id,
        ),
    )
    return note
