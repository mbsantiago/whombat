"""Test suite of Whombat core function to manage files."""

from collections.abc import Callable
from pathlib import Path

from whombat.core import files


def test_is_audio_file(tmp_path: Path):
    """Test the function to check if a file is an audio file."""
    # Only accept wav files for now
    audio_files = [
        tmp_path / "recording.WAV",
        tmp_path / "recording.wav",
        tmp_path / "directory/recording.WAV",
        tmp_path / "directory/recording.wav",
    ]

    non_audio_files = [
        tmp_path / "recording.mp3",
        tmp_path / "recording.mp4",
        tmp_path / "recording.aac",
        tmp_path / "recording.txt",
        tmp_path / "recording.csv",
        tmp_path / "recording.flac",
        tmp_path / "recording.ogg",
        tmp_path / "recording.webm",
    ]

    for path in audio_files:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.touch()
        assert files.is_audio_file(path)

    for path in non_audio_files:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.touch()
        assert not files.is_audio_file(path)


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
