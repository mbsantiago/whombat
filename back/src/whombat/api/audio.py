"""API functions to load audio."""
from pathlib import Path

from soundevent import audio, data

from whombat import schemas

__all__ = [
    "load_audio",
]


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
