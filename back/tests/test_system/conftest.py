from pathlib import Path

import pytest

from whombat.system.settings import Settings


@pytest.fixture
def test_db_path(tmp_path: Path) -> str:
    return str(tmp_path / "test.db")


@pytest.fixture
def test_audio_dir(tmp_path: Path) -> Path:
    audio_dir = tmp_path / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    return audio_dir


@pytest.fixture
def test_settings(
    test_db_path: str,
    test_audio_dir: Path,
) -> Settings:
    return Settings(
        dev=True,
        db_name=test_db_path,
        audio_dir=test_audio_dir,
        log_to_file=False,
        log_to_stdout=True,
        log_level="debug",
        open_on_startup=False,
    )
