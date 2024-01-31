"""API functions to load audio."""

import struct
from pathlib import Path

import soundfile as sf
from soundevent import audio, data

from whombat import schemas

__all__ = [
    "load_audio",
    "load_clip_bytes",
]

CHUNK_SIZE = 512 * 1024
HEADER_FORMAT = "<4si4s4sihhiihh4si"


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
    path: Path,
    start: int,
    end: int | None = None,
    speed: float = 1,
    time_expansion: float = 1,
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
    with open(path, "rb") as f:
        with sf.SoundFile(f) as sf_file:
            samplerate = sf_file.samplerate * time_expansion
            channels = sf_file.channels
            bit_depth = BIT_DEPTH_MAP.get(sf_file.subtype)

            if bit_depth is None:
                raise NotImplementedError(
                    f"Unsupported audio subtype: {sf_file.subtype}"
                )

            duration: float = sf_file.frames / samplerate
            start_time = start_time if start_time else 0.0
            end_time = end_time if end_time else duration

            start_frame = int(start_time * samplerate)
            end_frame = min(int(end_time * samplerate), sf_file.frames)

            sf_file.seek(start_frame)
            start_position = f.tell()

            sf_file.seek(end_frame)
            end_position = f.tell()

            data_size = end_position - start_position

            header = generate_wav_header(
                int(samplerate * speed),
                channels,
                data_size,
                bit_depth,
            )
            header_size = len(header)
            filesize = data_size + header_size

            bytes_to_load = end - start if end else CHUNK_SIZE

            if start < header_size:
                start = 0
                bytes_to_load -= header_size
            else:
                header = b""

            if bytes_to_load < 0:
                return header, 0, len(header), filesize

            current_position = start_position + max(start - header_size, 0)
            bytes_to_load = min(
                bytes_to_load,
                end_position - current_position,
            )

            f.seek(current_position)
            audio_bytes = f.read(bytes_to_load)

            data = bytes(header + audio_bytes)
            end = start + len(data) - 1
            return data, start, end, filesize


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
    samples
        Number of samples.
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
        1,  # Audio format (3 corresponds to float)
        channels,  # Number of channels
        samplerate,  # Sample rate in Hz
        byte_rate,  # Byte rate
        block_align,  # Block align
        bit_depth,  # Number of bits per sample
        b"data",  # data chunk id
        data_size,  # Size of the data chunk
    )
