"""Functions to handle images."""

from io import BytesIO

import numpy as np
from matplotlib.cm import get_cmap
from PIL import Image as img
from PIL.Image import Image

__all__ = [
    "array_to_image",
    "image_to_buffer",
]


def array_to_image(array: np.ndarray, cmap: str) -> Image:
    """Convert a numpy array to a PIL image.

    Parameters
    ----------
    array : np.ndarray
        The array to convert into an image. It must be a 2D array.

    Returns
    -------
    Image
        A Pillow Image object.

    Notes
    -----
    The array values must be between 0 and 1.
    """
    if array.ndim != 2:
        raise ValueError("The array must be 2D.")

    # Get the colormap
    colormap = get_cmap(cmap)

    # Flip the array vertically
    array = np.flipud(array)

    return img.fromarray(np.uint8(colormap(array) * 255))


def image_to_buffer(image: Image, fmt: str = "png") -> BytesIO:
    """Convert a PIL image to a BytesIO buffer."""
    buffer = BytesIO()
    image.save(buffer, format=fmt)
    buffer.seek(0)
    return buffer
