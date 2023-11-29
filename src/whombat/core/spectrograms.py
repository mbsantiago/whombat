"""Functions for spectrogram manipulation."""

import librosa
import numpy as np
import xarray as xr

from whombat import schemas

__all__ = [
    "clamp_amplitude",
    "scale_spectrogram",
    "pcen",
    "normalize_array",
]


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


def normalize_array(array: np.ndarray) -> np.ndarray:
    """Normalize array values to [0, 1].

    The minimum value will be mapped to 0 and the maximum value will be mapped
    to 1.

    Parameters
    ----------
    array : np.ndarray
        Array to normalize.

    Returns
    -------
    np.ndarray
        Normalized array.
    """
    array_min = array.min()
    array_max = array.max()
    array_range = array_max - array_min

    if array_range == 0:
        # If all values are the same, return zeros.
        return array - array_min

    array = (array - array.min()) / array_range
    return array
