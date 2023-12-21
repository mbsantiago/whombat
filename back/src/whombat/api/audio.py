"""API functions to load audio."""
from pathlib import Path

from soundevent import audio, data
from soundevent.audio.io import audio_to_bytes
from soundevent.audio.media_info import generate_wav_header

from whombat import schemas

__all__ = [
    "load_audio",
    "load_clip_bytes",
]

CHUNK_SIZE = 1024 * 1024


def load_audio(
    recording: schemas.Recording,
    start_time: float | None = None,
    end_time: float | None = None,
    audio_dir: Path = Path.cwd(),
    audio_parameters: schemas.AudioParameters = schemas.AudioParameters(),
):
    """Load audio.

    Parameters
    ----------
    recording
        The recording to load audio from.
    start_time
        Start time in seconds.
    end_time
        End time in seconds.
    audio_dir
        The directory where the audio files are stored.
    audio_parameters
        Audio parameters.

    Returns
    -------
    bytes
        Audio data.
    """
    # Set start and end times.
    if start_time is None:
        start_time = 0.0

    if end_time is None:
        end_time = recording.duration

    clip = data.Clip(
        recording=data.Recording(
            uuid=recording.uuid,
            path=audio_dir / recording.path,
            duration=recording.duration,
            samplerate=recording.samplerate,
            channels=recording.channels,
            time_expansion=recording.time_expansion,
        ),
        start_time=start_time,
        end_time=end_time,
    )

    # Load audio.
    wav = audio.load_clip(clip)

    # Resample audio.
    if audio_parameters.resample:
        wav = audio.resample_audio(wav, audio_parameters.samplerate)

    # Filter audio.
    if (
        audio_parameters.low_freq is not None
        or audio_parameters.high_freq is not None
    ):
        wav = audio.filter_audio(
            wav,
            low_freq=audio_parameters.low_freq,
            high_freq=audio_parameters.high_freq,
            order=audio_parameters.filter_order,
        )

    return wav


def load_clip_bytes(
    path: Path,
    samplerate: int,
    channels: int,
    duration: float,
    start: int,
    end: int | None = None,
    bit_depth: int = 16,
    speed: float = 1,
    start_time: float | None = None,
    end_time: float | None = None,
) -> tuple[bytes, int, int, int]:
    """Load audio.

    Parameters
    ----------
    clip
        The clip to load audio from.
    audio_dir
        The directory where the audio files are stored.
    audio_parameters
        Audio parameters.

    Returns
    -------
    bytes
        Loaded audio data in bytes
    start
        Start byte
    end
        End byte
    filesize
        Total size of clip in bytes.
    """

    end = end if end else start + CHUNK_SIZE
    start_time = start_time if start_time else 0.0
    end_time = end_time if end_time else duration
    total_samples = int((end_time - start_time) * samplerate)

    bytes_per_sample = channels * (bit_depth // 8)
    filesize = (total_samples * bytes_per_sample) + 44

    header = b""
    if start < 44:
        end = end - start
        start = 0
        header = generate_wav_header(
            int(samplerate * speed),
            channels,
            total_samples,
            bit_depth,
        )

    audio_bytes = load_audio_fragment(
        path=path,
        channels=channels,
        samplerate=samplerate,
        bit_depth=bit_depth,
        start_bytes=max(start - 44, 0),
        end_bytes=max(end - 44, 0),
        start_time=start_time,
        end_time=end_time,
    )

    data = bytes(header + audio_bytes)
    end = start + len(data)
    return data, start, end, filesize


def load_audio_fragment(
    path: Path,
    channels: int,
    samplerate: int,
    bit_depth: int,
    start_bytes: int,
    end_bytes: int | None = None,
    start_time: float | None = None,
    end_time: float | None = None,
) -> bytes:
    """Load a fragment of audio from a recording.

    This function loads a fragment of audio from a recording in bytes, using
    the provided parameters to specify the range or time window.

    Parameters
    ----------
    recording : schemas.Recording
        Data about the recording to load audio from.
    media_info : audio.MediaInfo
        Object containing information about the audio file.
    start_bytes : int
        The first byte to load from the recording.
    end_bytes : int, optional
        The last byte to load from the recording. If None, CHUNK_SIZE bytes
        will be loaded.
    start_time : float, optional
        If provided, the function will load audio starting from this time.
        Defaults to 0.0 if not specified.
    end_time : float, optional
        If provided, the function will load audio up to this time.
        No audio will be loaded after this time.

    Returns
    -------
    bytes
        Audio data.
    """

    # Set default value for end_bytes if not provided
    end_bytes = (
        end_bytes if end_bytes is not None else start_bytes + CHUNK_SIZE
    )

    # Set default values for start_time and end_time if not provided
    start_time = start_time if start_time is not None else 0.0
    end_time = end_time if end_time is not None else None

    # Calculate start sample position
    start_sample = int(start_time * samplerate)

    # Calculate bytes per sample based on channels and bit depth
    bytes_per_sample = channels * (bit_depth // 8)

    # Calculate offset and total bytes to load
    offset = int(start_bytes / bytes_per_sample)
    total_bytes = end_bytes - start_bytes

    # Calculate the number of samples to load
    samples = int(total_bytes / bytes_per_sample)

    # If end_time is provided, adjust the number of samples to load
    # so that the audio does not extend past the end_time
    if end_time is not None:
        end_sample = int(end_time * samplerate)
        samples = min(samples, end_sample - start_sample - offset)

    data, _ = audio.load_audio(
        path=path,
        offset=start_sample + offset,
        samples=samples,
    )
    return audio_to_bytes(data, samplerate, bit_depth)
