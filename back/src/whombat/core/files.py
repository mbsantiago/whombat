"""File handling functions."""
from dataclasses import dataclass
from pathlib import Path

from soundevent.audio import (
    MediaInfo,
    compute_md5_checksum,
    get_media_info,
    is_audio_file,
)

__all__ = [
    "get_audio_files_in_folder",
]


def get_audio_files_in_folder(
    audio_dir: Path, relative: bool = True
) -> list[Path]:
    """Get all path to audio files in a directory recursively.

    Only files with a .wav extension are considered recordings.

    Parameters
    ----------
    audio_dir: Path
        Path to the directory containing the audio files.
    relative: bool, optional
        If True, the returned paths will be relative to the audio_dir path.
        By default True.

    Returns
    -------
    recordings: list[Path]
    """
    return [
        path.relative_to(audio_dir) if relative else path.absolute()
        for path in audio_dir.rglob("*")
        if path.is_file() and is_audio_file(path)
    ]


@dataclass
class FileInfo:
    path: Path
    exists: bool
    is_audio: bool = False
    hash: str | None = None
    media_info: MediaInfo | None = None


def get_file_info(path: Path) -> FileInfo:
    """Get information about a file.

    This function will gather the following information about the file:

    - If the file exists.
    - If the file is an audio file.
    - The SHA256 hash of the file.
    - Information about the media file (duration, samplerate, etc).

    The hash and media information will only be computed if the file exists and
    is an audio file.

    Parameters
    ----------
    path: Path
        Path to the file.

    Returns
    -------
    file_info: FileInfo
        Information about the file.
    """
    if not path.is_file():
        return FileInfo(path=path, exists=False)

    if not is_audio_file(path):
        return FileInfo(path=path, exists=True, is_audio=False)

    hash = compute_md5_checksum(path)

    try:
        media_info = get_media_info(path)
    except ValueError:
        media_info = None

    return FileInfo(
        path=path,
        exists=True,
        is_audio=True,
        hash=hash,
        media_info=media_info,
    )
