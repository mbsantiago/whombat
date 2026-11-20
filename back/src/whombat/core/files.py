"""File handling functions."""

import logging
from dataclasses import dataclass
from pathlib import Path

from soundevent.audio import (
    MediaInfo,
    compute_md5_checksum,
    get_media_info,
    is_audio_file,
)

from whombat import exceptions

logger = logging.getLogger(__name__)

__all__ = [
    "get_audio_files_in_folder",
    "get_file_info",
    "FileInfo",
    "resolve_within_root",
    "is_within_root",
]


def resolve_within_root(candidate: Path, root: Path) -> Path:
    """Resolve a path and ensure it is contained within a root directory.

    Parameters
    ----------
    candidate: Path
        The path to resolve.
    root: Path
        The permitted root directory.

    Returns
    -------
    Path
        The resolved candidate path.

    Raises
    ------
    PathOutsideRootError
        If the resolved candidate is outside the resolved root.
    """
    resolved_candidate = candidate.resolve()
    resolved_root = root.resolve()
    if not resolved_candidate.is_relative_to(resolved_root):
        raise exceptions.PathOutsideRootError(
            f"Path {resolved_candidate} is outside root {resolved_root}"
        )
    return resolved_candidate


def is_within_root(candidate: Path, root: Path) -> bool:
    """Check whether a path resolves inside a root directory.

    Parameters
    ----------
    candidate: Path
        The path to check.
    root: Path
        The permitted root directory.

    Returns
    -------
    bool
        True if the resolved candidate is inside the resolved root.
    """
    try:
        resolve_within_root(candidate, root)
    except exceptions.PathOutsideRootError:
        return False
    return True


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
    logger.debug(f"Getting information about file: {path}")

    if not path.is_file():
        logger.warning(f"File does not exist: {path}")
        return FileInfo(path=path, exists=False)

    if not is_audio_file(path):
        logger.warning(f"File is not an audio file: {path}")
        return FileInfo(path=path, exists=True, is_audio=False)

    logger.debug(f"Computing hash of file: {path}")
    hash = compute_md5_checksum(path)
    logger.debug("done")

    try:
        logger.debug(f"Getting media info of file: {path}")
        media_info = get_media_info(path)
        logger.debug("done")
    except ValueError:
        logger.warning(f"Could not get media info of file: {path}")
        media_info = None

    logger.debug(f"Finished getting information about file: {path}")
    return FileInfo(
        path=path,
        exists=True,
        is_audio=True,
        hash=hash,
        media_info=media_info,
    )
