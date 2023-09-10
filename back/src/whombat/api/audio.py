"""API functions to load audio."""
from pathlib import Path

from soundevent import audio, data
from sqlalchemy.ext.asyncio import AsyncSession

import whombat.api.recordings as recordings
from whombat import schemas


async def load(
    session: AsyncSession,
    recording_id: int,
    start_time: float,
    end_time: float,
    audio_parameters: schemas.AudioParameters = schemas.AudioParameters(),
    audio_dir: Path = Path.cwd(),
):
    """Load audio.

    Parameters
    ----------
    session : Session
        SQLAlchemy session.
    recording_id : int
        Recording ID.
    start_time : float
        Start time in seconds.
    end_time : float
        End time in seconds.
    parameters : AudioParameters
        Audio parameters.

    Returns
    -------
    bytes
        Audio data.

    """
    # Get recording.
    recording = await recordings.get_by_id(session, recording_id)

    clip = data.Clip(
        recording=data.Recording(
            id=recording.uuid,
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
        wav = audio.resample(wav, audio_parameters.samplerate)

    # Filter audio.
    if (
        audio_parameters.low_freq is not None
        or audio_parameters.high_freq is not None
    ):
        wav = audio.filter(
            wav,
            low_freq=audio_parameters.low_freq,
            high_freq=audio_parameters.high_freq,
            order=audio_parameters.filter_order,
        )

    return wav
