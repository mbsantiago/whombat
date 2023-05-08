"""Common fixtures for Whombat tests."""""
import os
import random
import string
from pathlib import Path
from typing import Optional

import numpy as np
import pytest
import wavio


def random_string():
    """Generate a random string of fixed length."""
    options = string.ascii_uppercase + string.digits
    return "".join(random.choice(options) for _ in range(10))


def write_random_wav(
    path: Path,
    samplerate: int = 22100,
    duration: float = 0.1,
    channels: int = 1,
    sampwidth: int = 2,
) -> None:
    """Write a random wav file to disk."""
    frames = int(samplerate * duration)
    shape = (frames, channels)
    wav = np.random.random(size=shape)
    wavio.write(
        str(path),
        wav,
        rate=samplerate,
        sampwidth=sampwidth,
    )


@pytest.fixture
def random_wav_factory(tmp_path: Path):
    """Produce a random wav file."""
    def wav_factory(
        path: Optional[Path] = None,
        samplerate: int = 22100,
        duration: float = 0.1,
        channels: int = 1,
        sampwidth: int = 2,
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
            sampwidth=sampwidth,
        )

        return path

    return wav_factory
