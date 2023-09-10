"""API functions to generate spectrograms."""
from pathlib import Path

import librosa
import numpy as np
import xarray as xr
from soundevent import audio
from sqlalchemy.ext.asyncio import AsyncSession

import whombat.api.audio as audio_api
from whombat import schemas

__all__ = [
    "compute",
]


async def compute(
    session: AsyncSession,
    recording_id: int,
    start_time: float,
    end_time: float,
    audio_parameters: schemas.AudioParameters,
    spectrogram_parameters: schemas.SpectrogramParameters,
    audio_dir: Path = Path.cwd(),
) -> np.ndarray:
    """Compute a spectrogram for a recording.

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
    parameters : SpectrogramParameters
        Spectrogram parameters.

    Returns
    -------
    DataArray
        Spectrogram image.

    """
    wav = await audio_api.load(
        session,
        recording_id,
        start_time,
        end_time,
        audio_parameters,
        audio_dir=audio_dir,
    )

    # Select channel. Do this early to avoid unnecessary computation.
    wav = wav[dict(channel=[spectrogram_parameters.channel])]

    spectrogram = audio.compute_spectrogram(
        wav,
        window_size=spectrogram_parameters.window_size,
        hop_size=spectrogram_parameters.hop_size,
        window_type=spectrogram_parameters.window,
    )

    # De-noise spectrogram with PCEN
    if spectrogram_parameters.pcen:
        # NOTE: PCEN expects a spectrogram in amplitude scale so it should be
        # applied before scaling.
        spectrogram = pcen(spectrogram)

    # Scale spectrogram.
    array = scale_spectrogram(spectrogram.data, spectrogram_parameters.scale)

    # Clamp amplitude.
    if spectrogram_parameters.clamp:
        array = clamp_amplitude(
            array,
            spectrogram_parameters.min_dB,
            spectrogram_parameters.max_dB,
            spectrogram_parameters.scale,
        )

    # Remove unncecessary dimensions.
    array = array.squeeze()

    return array


def clamp_amplitude(
    spectogram: np.ndarray,
    min_dB: float,
    max_dB: float,
    scale: schemas.Scale,
) -> np.ndarray:
    """Clamp amplitude values.

    All values below min_dB will be set to min_dB, and all values above max_dB
    will be set to max_dB.

    Parameters
    ----------
    spectogram : DataArray
        Spectrogram image.
    min_dB : float
        Minimum amplitude value.
    max_dB : float
        Maximum amplitude value.
    scale : Scale
        Scale to use for spectrogram computation, either "amplitude", "power",
        or "dB".

    Returns
    -------
    DataArray
        Clamped spectrogram image.

    """
    if scale == "amplitude":
        min_dB = librosa.db_to_amplitude(min_dB)  # type: ignore
        max_dB = librosa.db_to_amplitude(max_dB)  # type: ignore

    if scale == "power":
        min_dB = librosa.db_to_power(min_dB)  # type: ignore
        max_dB = librosa.db_to_power(max_dB)  # type: ignore

    return np.clip(spectogram, min_dB, max_dB)


def scale_spectrogram(
    spec: np.ndarray,
    scale: schemas.Scale,
) -> np.ndarray:
    """Scale spectrogram.

    Parameters
    ----------
    spec : DataArray
        Spectrogram image.
    scale : Scale
        Scale to use for spectrogram computation, either "amplitude", "power",
        or "dB".

    Returns
    -------
    np.ndarray
        Scaled spectrogram image.
    """
    if scale == "dB":
        return librosa.amplitude_to_db(spec, amin=1e-10)  # type: ignore

    if scale == "power":
        return spec**2

    return spec


def pcen(spec: xr.DataArray) -> xr.DataArray:
    """Apply PCEN to spectrogram.

    Parameters
    ----------
    spec : DataArray
        Spectrogram image.
    sr : int
        Samplerate.
    hop_length : int
        The hop length of the spectrogram expressed in samples.

    Returns
    -------
    np.ndarray
        PCEN spectrogram image.
    """
    sr = spec.attrs["samplerate"]
    hop_length = int(spec.attrs["hop_size"] * sr)
    time_axis: int = spec.get_axis_num("time")  # type: ignore
    data = librosa.pcen(
        spec.data,
        sr=sr,
        hop_length=hop_length,
        axis=time_axis,
    )
    return xr.DataArray(
        data,
        dims=spec.dims,
        coords=spec.coords,
        attrs=spec.attrs,
    )
