"""REST API routes for spectrograms."""
from fastapi import APIRouter, Depends, Response

from whombat import api, schemas
from whombat.core import images
from whombat.dependencies import Session, WhombatSettings

__all__ = ["spectrograms_router"]

spectrograms_router = APIRouter()


@spectrograms_router.get(
    "/",
)
async def get_spectrogram(
    session: Session,
    settings: WhombatSettings,
    recording_id: int,
    start_time: float,
    end_time: float,
    audio_parameters: schemas.AudioParameters = Depends(
        schemas.AudioParameters
    ),
    spectrogram_parameters: schemas.SpectrogramParameters = Depends(
        schemas.SpectrogramParameters
    ),
) -> Response:
    """Get a spectrogram for a recording.

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
    Response
        Spectrogram image.

    """
    data = await api.spectrograms.compute(
        session,
        recording_id,
        start_time,
        end_time,
        audio_parameters,
        spectrogram_parameters,
        audio_dir=settings.audio_dir,
    )

    # Normalize.
    data_min = data.min()
    data_max = data.max()
    data_range = data_max - data_min
    if data_range > 0:
        data = (data - data.min()) / data_range

    image = images.array_to_image(
        data,
        cmap=spectrogram_parameters.cmap,
    )

    buffer = images.image_to_buffer(image)

    return Response(
        content=buffer.read(),
        media_type="image/png",
    )
