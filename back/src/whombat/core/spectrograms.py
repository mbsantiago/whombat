"""Functions for spectrogram manipulation."""

import xarray as xr

__all__ = [
    "normalize_spectrogram",
]


def normalize_spectrogram(
    spectrogram: xr.DataArray,
    relative: bool = False,
) -> xr.DataArray:
    """Normalize array values to [0, 1].

    The minimum value will be mapped to 0 and the maximum value will be mapped
    to 1.

    Parameters
    ----------
    spectrogram : xr.DataArray
        The spectrogram to normalize.
    relative : bool
        If True, use the minimum and maximum values of the spectrogram to
        normalize. If False, use the minimum and maximum values of the
        spectrogram's attributes.

    Returns
    -------
    xr.DataArray
        Normalized array.
    """

    attrs = spectrogram.attrs
    min_val = attrs.get("min_dB")
    if min_val is None or relative:
        min_val = spectrogram.min()

    max_val = attrs.get("max_dB")
    if max_val is None or relative:
        max_val = spectrogram.max()

    array_range = max_val - min_val

    if array_range == 0:
        # If all values are the same, return zeros.
        return spectrogram * 0

    return (spectrogram - min_val) / array_range
