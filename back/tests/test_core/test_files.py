"""Test suite of Whombat core function to manage files."""

from collections.abc import Callable
from pathlib import Path
import pytest

from whombat.core import files


@pytest.mark.parametrize(
    "filename",
    [
        "recording.wav",
        "recording.WAV",
        "recording.mp3",
        "recording.flac",
        "recording.ogg",
    ],
)
def test_is_audio_file(filename: str, tmp_path: Path):
    """Test the function to check if a file is an audio file."""
    file_path = tmp_path / filename
    file_path.touch()
    assert files.is_audio_file(file_path)


@pytest.mark.parametrize(
    "filename",
    [
        "recording.webm",
        "recording.mkv",
        "recording.avi",
        "recording.txt",
        "recording.csv",
    ],
)
def test_can_identiy_invalid_audio_files(filename: str, tmp_path: Path):
    """Test the function to check if a file is an audio file."""
    file_path = tmp_path / filename
    file_path.touch()
    assert not files.is_audio_file(file_path)


def test_get_audio_files_in_folder(
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test the function to get all recordings in a folder."""
    test_audio_dir = tmp_path / "test_audio_dir"
    test_audio_dir.mkdir()

    # Create wav files
    random_wav_factory(path=test_audio_dir / "wav1.wav")

    # With different extensions variations
    random_wav_factory(path=test_audio_dir / "wav2.WAV")

    # In a nested folder
    nested_dir = test_audio_dir / "foo"
    nested_dir.mkdir()
    random_wav_factory(path=nested_dir / "wav3.wav")

    # And a text file
    text_file_path = test_audio_dir / "text.txt"
    text_file_path.touch()

    recordings = files.get_audio_files_in_folder(test_audio_dir)
    assert len(recordings) == 3
    assert set(recordings) == {
        Path("wav1.wav"),
        Path("wav2.WAV"),
        Path("foo") / "wav3.wav",
    }
