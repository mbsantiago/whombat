"""Test suite of Whombat core function to manage files."""
from collections.abc import Callable
from pathlib import Path

from whombat.core import files


def test_is_audio_file():
    """Test the function to check if a file is an audio file."""
    # Only accept wav files for now
    assert files.is_audio_file(Path("recording.WAV"))
    assert files.is_audio_file(Path("recording.wav"))
    assert files.is_audio_file(Path("directory/recording.WAV"))
    assert files.is_audio_file(Path("directory/recording.wav"))
    assert not files.is_audio_file(Path("recording.Wav"))
    assert not files.is_audio_file(Path("recording.mp3"))
    assert not files.is_audio_file(Path("recording.mp4"))
    assert not files.is_audio_file(Path("recording.aac"))
    assert not files.is_audio_file(Path("recording.txt"))
    assert not files.is_audio_file(Path("recording.csv"))
    assert not files.is_audio_file(Path("recording.flac"))
    assert not files.is_audio_file(Path("recording.ogg"))
    assert not files.is_audio_file(Path("recording.webm"))


def test_get_audio_files_in_folder(
    tmp_path: Path,
    random_wav_factory: Callable[..., Path],
):
    """Test the function to get all recordings in a folder."""
    test_audio_dir = tmp_path / "audio"
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
