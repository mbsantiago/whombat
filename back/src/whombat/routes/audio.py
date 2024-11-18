"""REST API routes for audio."""

from io import BytesIO
from typing import Annotated
from uuid import UUID

import soundfile as sf
from fastapi import APIRouter, Depends, Header, Response
from fastapi.responses import StreamingResponse

from whombat import api, schemas
from whombat.routes.dependencies import Session, WhombatSettings

__all__ = ["audio_router"]

audio_router = APIRouter()

CHUNK_SIZE = 1024 * 256


# app.py or the appropriate module

import fsspec

@audio_router.get("/stream/")
async def stream_recording_audio(
    session: Session,
    settings: WhombatSettings,
    recording_uuid: UUID,
    start_time: float | None = None,
    end_time: float | None = None,
    speed: float = 1,
    range: str = Header(None),
) -> Response:
    """Stream the audio of a recording."""
    audio_dir = settings.audio_dir
    recording = await api.recordings.get(session, recording_uuid)

    # Calculate start byte
    start, _ = range.replace("bytes=", "").split("-")
    start = int(start)

    if start_time is not None:
        start_time = start_time * recording.time_expansion

    if end_time is not None:
        end_time = end_time * recording.time_expansion

    data, start, end, filesize = await api.load_clip_bytes(
        path=f"{audio_dir}/{recording.path}",
        start=start,
        frames=CHUNK_SIZE,
        speed=speed * recording.time_expansion,
        start_time=start_time,
        end_time=end_time,
        settings=settings,
    )

    headers = {
        "Content-Range": f"bytes {start}-{end}/{filesize}",
        "Content-Length": f"{len(data)}",
        "Accept-Ranges": "bytes",
    }
    return Response(
        content=data,
        status_code=206,
        media_type="audio/wav",
        headers=headers,
    )



@audio_router.get("/download/")
async def download_recording_audio(
    session: Session,
    settings: WhombatSettings,
    recording_uuid: UUID,
    audio_parameters: Annotated[
        schemas.AudioParameters,  # type: ignore
        Depends(schemas.AudioParameters),
    ],
    start_time: float | None = None,
    end_time: float | None = None,
) -> StreamingResponse:
    """Get audio for a recording.

    Parameters
    ----------
    session
        Database session.
    settings
        Whombat settings.
    recording_uuid
        The UUID of the recording.
    start_time
        The start time of the audio to return, by default None. If None, the
        audio will start at the beginning of the recording.
    end_time
        The end time of the audio to return, by default None. If None, the
        audio will end at the end of the recording.
    audio_parameters
        Audio parameters to use when processing the audio. Includes
        resampling and filtering parameters.

    Returns
    -------
    Response
        The audio file.
    """
    recording = await api.recordings.get(session, recording_uuid)

    audio = api.load_audio(
        recording,
        start_time=start_time,
        end_time=end_time,
        audio_parameters=audio_parameters,
        audio_dir=settings.audio_dir,
    )

    # Get the samplerate and recording ID.
    samplerate = int(1 / audio.time.attrs["step"])
    id = audio.attrs["recording_id"]

    # Write the audio to a buffer.
    buffer = BytesIO()
    sf.write(buffer, audio.data, samplerate, format="WAV")
    buffer.seek(0)

    # Return the audio.
    return StreamingResponse(
        content=buffer,
        media_type="audio/wav",
        headers={"Content-Disposition": f"attachment; filename={id}.wav"},
    )
