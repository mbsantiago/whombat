"""API functions to load audio."""

import struct
from pathlib import Path

import soundfile as sf
from soundevent import audio, data
from soundevent.arrays import extend_dim
from soundevent.audio.io import audio_to_bytes

from whombat import schemas

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
    audio_dir: Path | None = None,
    audio_parameters: schemas.AudioParameters | None = None,
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
    if audio_dir is None:
        audio_dir = Path().cwd()

    if audio_parameters is None:
        audio_parameters = schemas.AudioParameters()

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

    if clip.start_time < 0:
        clip.start_time = 0

    # Load audio.
    wave = audio.load_clip(clip)

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
    path: Path,
    start: int,
    speed: float = 1,
    frames: int = 8192,
    time_expansion: float = 1,
    start_time: float | None = None,
    end_time: float | None = None,
    bit_depth: int = 16,
) -> tuple[bytes, int, int, int]:
    """Load audio.

    Parameters
    ----------
    clip
        The clip to load audio from.
    start
        Start byte.
    end
        End byte.
    speed
        Speed of the audio.
    time_expansion
        Time expansion factor.
    start_time
        Start time in seconds.
    end_time
        End time in seconds.

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
    with sf.SoundFile(path) as sf_file:
        samplerate = int(sf_file.samplerate * time_expansion)
        channels = sf_file.channels

        # Calculate start and end frames based on start and end times
        # to ensure that the requested piece of audio is loaded.
        if start_time is None:
            start_time = 0
        start_frame = int(start_time * samplerate)

        end_frame = sf_file.frames
        if end_time is not None:
            end_frame = int(end_time * samplerate)

        # Calculate the total number of frames and the size of the audio
        # data in bytes.
        total_frames = end_frame - start_frame
        bytes_per_frame = channels * bit_depth // 8
        filesize = total_frames * bytes_per_frame

        # Compute the offset, which is the frame at which to start reading
        # the audio data.
        offset = start_frame
        if start != 0:
            # When the start byte is not 0, calculate the offset in frames
            # and add it to the start frame. Note that we need to
            # remove the size of the header from the start byte to correctly
            # calculate the offset in frames.
            offset_frames = (start - HEADER_SIZE) // bytes_per_frame
            offset += offset_frames

        # Make sure that the number of frames to read is not greater than
        # the number of frames requested.
        frames = min(frames, end_frame - offset)

        sf_file.seek(offset)
        audio_data = sf_file.read(frames, fill_value=0, always_2d=True)

        # Convert the audio data to raw bytes
        audio_bytes = audio_to_bytes(
            audio_data,
            samplerate=samplerate,
            bit_depth=bit_depth,
        )

        # Generate the WAV header if the start byte is 0 and
        # append to the start of the audio data.
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
