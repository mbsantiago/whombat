"""File handling functions."""
import hashlib
import re
import wave
from collections import namedtuple
from dataclasses import dataclass
from pathlib import Path

__all__ = [
    "is_audio_file",
    "get_audio_files_in_folder",
    "get_media_info",
    "get_file_info",
    "compute_hash",
    "MediaInfo",
]

AUDIO_FILE_PATTERN = re.compile(r"\.(wav|WAV)$")


def is_audio_file(filename: Path) -> bool:
    """Determine if file is an audio file by its extension.

    Currently only WAV files are considered audio files.

    Parameters
    ----------
    filename: Path
        Path to the file.

    Returns
    -------
    is_audio: bool
        True if the file is an audio file, False otherwise.
    """
    return AUDIO_FILE_PATTERN.search(str(filename)) is not None


def get_audio_files_in_folder(audio_dir: Path, relative: bool = True) -> list[Path]:
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


MediaInfo = namedtuple(
    "MediaInfo",
    [
        "duration",
        "samplerate",
        "channels",
        "length",
        "sampwidth",
    ],
)
"""Information about a media file."""


def get_media_info(path: Path) -> MediaInfo:
    """Get media information from an audio file.

    Parameters
    ----------
    path: Path
        Path to the audio file.

    Returns
    -------
    media_info: MediaInfo
        Tuple containing information about the media file.

    Raises
    ------
    wave.Error
        If the file is not a WAV file.

    Notes
    -----
    Currently, this function only supports WAV files.
    """
    with wave.open(str(path), "r") as wav:
        params = wav.getparams()
        return MediaInfo(
            duration=params.nframes / params.framerate,
            samplerate=params.framerate,
            length=params.nframes,
            channels=params.nchannels,
            sampwidth=params.sampwidth,
        )


BLOCKSIZE = 65536
"""Size of the block to read from the file when computing hash."""


def compute_hash(path: Path) -> str:
    """Compute the SHA256 hash of a file.

    Will read the file in blocks of 65536 bytes to avoid loading the entire
    file into memory.

    Parameters
    ----------
    path: Path
        Path to the file.

    Returns
    -------
    hash: str
        The SHA256 hash of the file.
    """
    sha256 = hashlib.sha256()
    with path.open("rb") as file:
        while True:
            data = file.read(BLOCKSIZE)
            if not data:
                break
            sha256.update(data)
    return sha256.hexdigest()


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

    hash = compute_hash(path)

    try:
        media_info = get_media_info(path)
    except wave.Error:
        media_info = None

    return FileInfo(
        path=path,
        exists=True,
        is_audio=True,
        hash=hash,
        media_info=media_info,
    )
