"""API functions to load audio."""

import struct
from pathlib import Path

import fsspec
import soundfile as sf
from soundevent import audio, data
from soundevent.arrays import extend_dim
from soundevent.audio.io import audio_to_bytes

from whombat import schemas
from whombat.system import get_settings

__all__ = [
    "load_audio",
    "load_clip_bytes",
]

CHUNK_SIZE = 512 * 1024
HEADER_FORMAT = "<4si4s4sihhiihh4si"
HEADER_SIZE = struct.calcsize(HEADER_FORMAT)


def load_audio(
    recording: schemas.Recording,
    start_time: float | None = None,
    end_time: float | None = None,
    audio_dir: str | None = None,
    audio_parameters: schemas.AudioParameters | None = None,
    settings=None,
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
    settings
        Application settings containing AWS credentials.

    Returns
    -------
    wave
        Audio data as a NumPy array.
    """
    if settings is None:
        settings = get_settings()

    if audio_dir is None:
        audio_dir = settings.audio_dir

    if audio_parameters is None:
        audio_parameters = schemas.AudioParameters()

    # Set start and end times.
    if start_time is None:
        start_time = 0.0

    if end_time is None:
        end_time = recording.duration

    # Construct the full path
    path = f"{audio_dir}/{recording.path}"

    # Open the file using fsspec
    fs = fsspec.filesystem(
        's3',
        key=settings.aws_access_key_id,
        secret=settings.aws_secret_access_key,
        client_kwargs={'region_name': settings.aws_region},
        endpoint_url=settings.s3_endpoint_url,
    )

    with fs.open(path, 'rb') as f:
        # Use soundfile to read the audio data
        with sf.SoundFile(f) as sf_file:
            samplerate = int(sf_file.samplerate * recording.time_expansion)
            channels = sf_file.channels

            # Calculate start and end frames
            start_frame = int(start_time * samplerate)
            end_frame = int(end_time * samplerate)

            sf_file.seek(start_frame)
            frames_to_read = end_frame - start_frame
            audio_data = sf_file.read(frames_to_read, dtype='float32', always_2d=True)

    wave = audio_data

    if start_time < 0:
        wave = extend_dim(wave, "time", start=start_time)

    # Resample audio.
    if audio_parameters.resample:
        wave = audio.resample(wave, audio_parameters.samplerate)

    # Filter audio.
    if (
        audio_parameters.low_freq is not None
        or audio_parameters.high_freq is not None
    ):
        wave = audio.filter(
            wave,
            low_freq=audio_parameters.low_freq,
            high_freq=audio_parameters.high_freq,
            order=audio_parameters.filter_order,
        )

    return wave


BIT_DEPTH_MAP: dict[str, int] = {
    "PCM_S8": 8,
    "PCM_16": 16,
    "PCM_24": 24,
    "PCM_32": 32,
    "PCM_U8": 8,
    "FLOAT": 32,
    "DOUBLE": 64,
}


def load_clip_bytes(
    path: str,
    start: int,
    speed: float = 1,
    frames: int = 8192,
    time_expansion: float = 1,
    start_time: float | None = None,
    end_time: float | None = None,
    bit_depth: int = 16,
    settings=None,
) -> tuple[bytes, int, int, int]:
    """Load audio.

    Parameters
    ----------
    path
        The path to the audio file.
    start
        Start byte.
    speed
        The factor by which to speed up or slow down the audio.
        By default, it is 1.
    frames
        The number of audio frames to read at a time.
    time_expansion
        Time expansion factor of the audio. By default, it is 1.
    start_time
        The time in seconds at which to start reading the audio.
    end_time
        The time in seconds at which to stop reading the audio.
    bit_depth
        The bit depth of the resulting audio. By default, it is 16 bits.
    settings
        Application settings containing AWS credentials.

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
    if settings is None:
        settings = get_settings()

    # Determine the filesystem based on the path
    if path.startswith('s3://'):
        fs = fsspec.filesystem(
            's3',
            key=settings.aws_access_key_id,
            secret=settings.aws_secret_access_key,
            client_kwargs={'region_name': settings.aws_region},
            endpoint_url=settings.s3_endpoint_url,
        )
    else:
        fs = fsspec.filesystem('file')

    # Open the file using fs
    with fs.open(path, 'rb') as f:
        # Use sf.SoundFile with file-like object
        with sf.SoundFile(f) as sf_file:
            samplerate = int(sf_file.samplerate * time_expansion)
            channels = sf_file.channels

            # Calculate start and end frames based on start and end times
            if start_time is None:
                start_time = 0
            start_frame = int(start_time * samplerate)

            end_frame = sf_file.frames
            if end_time is not None:
                end_frame = int(end_time * samplerate)

            # Calculate the total number of frames and the size of the audio data in bytes.
            total_frames = end_frame - start_frame
            bytes_per_frame = channels * bit_depth // 8
            filesize = total_frames * bytes_per_frame

            # Compute the offset
            offset = start_frame
            if start != 0:
                offset_frames = (start - HEADER_SIZE) // bytes_per_frame
                offset += offset_frames

            # Ensure frames to read is within bounds
            frames = min(frames, end_frame - offset)

            sf_file.seek(offset)
            audio_data = sf_file.read(frames, fill_value=0, always_2d=True)

            # Convert the audio data to raw bytes
            audio_bytes = audio_to_bytes(
                audio_data,
                samplerate=samplerate,
                bit_depth=bit_depth,
            )

            # Generate the WAV header if necessary
            if start == 0:
                header = generate_wav_header(
                    samplerate=int(samplerate * speed),
                    channels=channels,
                    data_size=filesize,
                    bit_depth=bit_depth,
                )
                audio_bytes = header + audio_bytes

            return (
                audio_bytes,
                start,
                start + len(audio_bytes),
                filesize + HEADER_SIZE,
            )


def generate_wav_header(
    samplerate: int,
    channels: int,
    data_size: int,
    bit_depth: int = 16,
) -> bytes:
    """Generate the data of a WAV header.

    This function generates the data of a WAV header according to the
    given parameters. The WAV header is a 44-byte string that contains
    information about the audio data, such as the sample rate, the
    number of channels, and the number of samples. The WAV header
    assumes that the audio data is PCM encoded.

    Parameters
    ----------
    samplerate
        Sample rate in Hz.
    channels
        Number of channels.
    data_size
        Size of the data chunk.
    bit_depth
        The number of bits per sample. By default, it is 16 bits.

    Notes
    -----
    The structure of the WAV header is described in
    (WAV PCM soundfile format)[http://soundfile.sapp.org/doc/WaveFormat/].
    """
    byte_rate = samplerate * channels * bit_depth // 8
    block_align = channels * bit_depth // 8

    return struct.pack(
        HEADER_FORMAT,
        b"RIFF",  # RIFF chunk id
        data_size + 36,  # Size of the entire file minus 8 bytes
        b"WAVE",  # RIFF chunk id
        b"fmt ",  # fmt chunk id
        16,  # Size of the fmt chunk
        1,  # Audio format (1 corresponds to PCM)
        channels,  # Number of channels
        samplerate,  # Sample rate in Hz
        byte_rate,  # Byte rate
        block_align,  # Block align
        bit_depth,  # Number of bits per sample
        b"data",  # data chunk id
        data_size,  # Size of the data chunk
    )
