"""Schemas for spectrograms."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

__all__ = [
    "SpectrogramParameters",
    "STFTParameters",
    "AmplitudeParameters",
    "Scale",
    "Window",
]

Window = Literal[
    "boxcar",
    "triang",
    "bartlett",
    "flattop",
    "parzen",
    "bohman",
    "blackman",
    "blackmanharris",
    "nuttall",
    "barthann",
    "hamming",
    "hann",
    "kaiser",
]


class STFTParameters(BaseModel):
    """Parameters for STFT computation."""

    window_size: float = 0.025
    """Size of FFT window in seconds."""

    hop_size: float = Field(default=0.5, gt=0.0, le=1.0)
    """Hop size as a fraction of window size."""

    window: Window = "hann"
    """Window function."""

    @field_validator("window_size", "hop_size")
    @classmethod
    def check_positive(cls, value):
        """Check that window size and hop size are positive."""
        if value <= 0:
            raise ValueError("Window size and hop size must be positive.")
        return value


Scale = Literal["amplitude", "power", "dB"]


class AmplitudeParameters(BaseModel):
    """Parameters for amplitude clamping."""

    scale: Scale = "dB"
    """Scale to use for spectrogram computation."""

    clamp: bool = False
    """Whether to clamp amplitude values."""

    min_dB: float = -100.0
    """Minimum amplitude value."""

    max_dB: float = 0
    """Maximum amplitude value."""

    normalize: bool = True
    """Whether to normalize spectrogram before amplitude scaling.

    If `True`, the spectrogram will be normalized to the range [0, 1] before
    amplitude scaling. In particular dB values are relative to the maximum
    amplitude value in the spectrogram, and not the maximum possible amplitude
    value of the recorder.

    This can have the effect of making the spectrogram appear noisier than it
    actually is, since the maximum amplitude value in the spectrogram may be
    much lower than the maximum possible amplitude value of the recorder.

    Also, when visualizing spectrograms in clips, the amplitude scale will be
    relative to the maximum amplitude value in the clip, and not the maximum
    of the recording as a whole. This can make it difficult to compare
    amplitude levels across clips, and will create artificial seams between
    clips when visualizing spectrograms in recordings.
    """

    @field_validator("min_dB", "max_dB")
    @classmethod
    def check_db_are_negative(cls, value):
        """Check that min_dB and max_dB are non positive."""
        if value > 0:
            raise ValueError("min_dB and max_dB must be non positive.")
        return value

    @model_validator(mode="after")
    def check_min_dB_and_max_dB(self):
        """Check that min_dB is less than max_dB."""
        if self.min_dB > self.max_dB:
            raise ValueError("min_dB must be less than max_dB.")
        return self


class SpectrogramParameters(STFTParameters, AmplitudeParameters):
    """Parameters for spectrogram computation."""

    channel: int = 0
    """Channel to use for spectrogram computation."""

    pcen: bool = True
    """Whether to apply PCEN for de-noising."""

    cmap: str = "gray"
    """Colormap to use for spectrogram."""
