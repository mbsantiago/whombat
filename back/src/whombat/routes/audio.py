"""REST API routes for audio."""
from io import BytesIO

import soundfile as sf
from fastapi import APIRouter, Depends, Header, Response
from fastapi.responses import StreamingResponse

from whombat import api, schemas
from whombat.dependencies import Session, WhombatSettings

__all__ = ["audio_router"]

audio_router = APIRouter()

CHUNK_SIZE = 1024 * 1024


@audio_router.get("/stream/")
async def stream_recording_audio(
    session: Session,
    settings: WhombatSettings,
    recording_id: int,
    # audio_parameters: schemas.AudioParameters = Depends(
    #     schemas.AudioParameters
    # ),
    range: str = Header(None),
) -> Response:
    """Stream the audio of a recording.

    Parameters
    ----------
    session : Session
        Database session.
    settings : WhombatSettings
        Whombat settings.
    recording_id : int
        The ID of the recording.

    Returns
    -------
    Response
        The audio file.
    """
    audio = await api.recordings.get_by_id(session, recording_id)
    full_path = settings.audio_dir / audio.path

    start, end = range.replace("bytes=", "").split("-")
    start = int(start)
    end = int(end) if end else start + CHUNK_SIZE

    with open(full_path, "rb") as fp:
        fp.seek(start)
        data = fp.read(end - start)
        filesize = str(full_path.stat().st_size)
        headers = {
            "Content-Range": f"bytes {start}-{end}/{filesize}",
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
    recording_id: int,
    start_time: float | None = None,
    end_time: float | None = None,
    audio_parameters: schemas.AudioParameters = Depends(
        schemas.AudioParameters
    ),
) -> Response:
    """Get audio for a recording.

    Parameters
    ----------
    session : Session
        Database session.
    settings : WhombatSettings
        Whombat settings.
    recording_id : int
        The ID of the recording.
    start_time : float, optional
        The start time of the audio to return, by default None. If None, the
        audio will start at the beginning of the recording.
    end_time : float, optional
        The end time of the audio to return, by default None. If None, the
        audio will end at the end of the recording.
    audio_parameters : schemas.AudioParameters, optional
        Audio parameters to use when processing the audio. Includes
        resampling and filtering parameters.

    Returns
    -------
    Response
        The audio file.
    """
    audio = await api.audio.load(
        session,
        recording_id,
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
        headers={
            "Content-Disposition": f"attachment; filename={id}.wav"
        },
    )
