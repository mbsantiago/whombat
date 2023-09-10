"""Schemas for spectrograms."""

from pydantic import BaseModel

__all__ = [
    "AudioParameters",
]


class ResamplingParameters(BaseModel):
    """Parameters for resampling."""

    resample: bool = False
    """Whether to resample the audio."""

    samplerate: int = 44100
    """Target samplerate if resampling."""


class FilteringParameters(BaseModel):
    """Parameters for filtering.

    If both `low_freq` and `high_freq` are `None`, no filtering will be
    applied. Otherwise, a bandpass, lowpass, or highpass filter will be
    applied, depending on which of the two is `None`.
    """

    low_freq: float | None = None
    """Low frequency cutoff. Sounds of lower frequency will be attenuated."""

    high_freq: float | None = None
    """High frequency cutoff. Sounds of higher frequency will be attenuated."""

    filter_order: int = 5
    """Filter order for filtering."""


class AudioParameters(
    ResamplingParameters,
    FilteringParameters,
):
    """Parameters for audio loading."""
