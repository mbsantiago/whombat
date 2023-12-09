"""REST API routes for audio."""
from io import BytesIO
from uuid import UUID

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
    recording_uuid: UUID,
    speed: float = 1,
    # audio_parameters: schemas.AudioParameters = Depends(
    #     schemas.AudioParameters
    # ),
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
    recording = await api.recordings.get(session, recording_uuid)
    full_path = settings.audio_dir / recording.path

    start, end = range.replace("bytes=", "").split("-")
    start = int(start)
    end = int(end) if end else start + CHUNK_SIZE

    with open(full_path, "rb") as fp:
        fp.seek(start)
        data = fp.read(end - start)

        # We want to adjust the samplerate of the audio if the user has
        # requested a different playback speed or if the recording has been
        # time expanded.
        if start < 32 and (speed != 1 or recording.time_expansion != 1):
            # Surgically replace the samplerate in the WAV header.
            # The samplerate should be stored in bytes 24-34 of the header.
            # as a little-endian unsigned 32-bit integer.
            samplerate = int(recording.samplerate * speed)

            # We also need to adjust the number of bytes per second.
            # This is stored in bytes 28-32 of the header. The
            # ByteRate is the SampleRate * NumChannels * BitsPerSample / 8.
            # and the BitsPerSample is stored in bytes 34-36 of the header.
            bits_per_sample = int.from_bytes(
                data[34 - start : 36 - start], "little"
            )
            bytes_per_second = int(
                samplerate * recording.channels * bits_per_sample / 8
            )

            data = (
                data[: 24 - start]
                + samplerate.to_bytes(4, "little")
                + bytes_per_second.to_bytes(4, "little")
                + data[32 - start :]
            )

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
    recording_uuid: UUID,
    start_time: float | None = None,
    end_time: float | None = None,
    audio_parameters: schemas.AudioParameters = Depends(
        schemas.AudioParameters
    ),
) -> Response:
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
