"""REST API routes for audio."""

from io import BytesIO
from uuid import UUID

import soundfile as sf
from fastapi import APIRouter, Depends, Header, Response
from fastapi.responses import StreamingResponse

from whombat import api, schemas
from whombat.routes.dependencies import Session, WhombatSettings

__all__ = ["audio_router"]

audio_router = APIRouter()

CHUNK_SIZE = 1024 * 124


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
    """Stream the audio of a recording.

    Parameters
    ----------
    session
        Database session.
    settings
        Whombat settings.
    recording_uuid
        The ID of the recording.

    Returns
    -------
    Response
        The audio file.
    """
    audio_dir = settings.audio_dir
    recording = await api.recordings.get(
        session,
        recording_uuid,
    )

    start, end = range.replace("bytes=", "").split("-")
    start = int(start)
    end = int(end) if end else start + CHUNK_SIZE

    data, start, end, filesize = api.load_clip_bytes(
        path=audio_dir / recording.path,
        start=start,
        end=end,
        time_expansion=recording.time_expansion,
        speed=speed,
        start_time=start_time,
        end_time=end_time,
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
    start_time: float | None = None,
    end_time: float | None = None,
    audio_parameters: schemas.AudioParameters = Depends(
        schemas.AudioParameters
    ),
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
    samplerate = audio.attrs["samplerate"]
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
