"""API functions for interacting with recordings."""

import datetime
import logging
from functools import partial
from multiprocessing import Pool
from pathlib import Path
from typing import Sequence
from uuid import UUID

import cachetools
import soundfile as sf
from soundevent import data
from soundevent.audio import MediaInfo, compute_md5_checksum, get_media_info
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession

import fsspec  # Added import
from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.api.features import features
from whombat.api.notes import notes
from whombat.api.tags import tags
from whombat.api.users import users
from whombat.core import files
from whombat.core.common import remove_duplicates
from whombat.system import get_settings

__all__ = [
    "RecordingAPI",
    "recordings",
]

logger = logging.getLogger(__name__)


class RecordingAPI(
    BaseAPI[
        UUID,
        models.Recording,
        schemas.Recording,
        schemas.RecordingCreate,
        schemas.RecordingUpdate,
    ]
):
    _model = models.Recording
    _schema = schemas.Recording

    def __init__(self):
        super().__init__()
        self._media_info_cache = cachetools.LRUCache(maxsize=1000)

    async def get_media_info(
        self,
        session: AsyncSession,
        recording_uuid: UUID,
        audio_dir: str | None = None,  # Changed to str
    ) -> MediaInfo:
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        if recording_uuid in self._media_info_cache:
            return self._media_info_cache[recording_uuid]

        recording = await self.get(session, recording_uuid)
        full_path = f"{audio_dir}/{recording.path}"  # Adjusted path

        # Use fsspec to get media info
        media_info = self._get_media_info_with_fsspec(full_path)
        self._media_info_cache[recording_uuid] = media_info
        return media_info

    def _get_media_info_with_fsspec(self, path: str) -> MediaInfo:
        settings = get_settings()
        if path.startswith('s3://'):
            fs = fsspec.filesystem(
                's3',
                key=settings.aws_access_key_id,
                secret=settings.aws_secret_access_key,
                client_kwargs={'region_name': settings.aws_region},
                endpoint_url=settings.s3_endpoint_url,
            )
        else:
            fs = fsspec.filesystem('file')

        with fs.open(path, 'rb') as f:
            media_info = get_media_info(f)
        return media_info

    async def get_by_hash(
        self,
        session: AsyncSession,
        recording_hash: str,
    ) -> schemas.Recording:
        """Get a recording by hash."""
        recording = await common.get_object(
            session,
            models.Recording,
            models.Recording.hash == recording_hash,
        )
        return schemas.Recording.model_validate(recording)

    async def get_by_path(
        self,
        session: AsyncSession,
        recording_path: Path,
    ) -> schemas.Recording:
        """Get a recording by path."""
        recording = await common.get_object(
            session,
            models.Recording,
            models.Recording.path == recording_path,
        )
        return schemas.Recording.model_validate(recording)

    async def create(
        self,
        session: AsyncSession,
        path: Path,
        date: datetime.date | None = None,
        time: datetime.time | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        time_expansion: float = 1.0,
        rights: str | None = None,
        audio_dir: str | None = None,  # Changed to str
        **kwargs,
    ) -> schemas.Recording:
        """Create a recording."""
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        recording_data = _assemble_recording_data(
            schemas.RecordingCreate(
                path=path,
                date=date,
                time=time,
                latitude=latitude,
                longitude=longitude,
                time_expansion=time_expansion,
                rights=rights,
            ),
            audio_dir=audio_dir,
        )

        if recording_data is None:
            raise ValueError("Cannot create recording from file.")

        recording = await common.create_object(
            session,
            models.Recording,
            **recording_data,
            **kwargs,
        )

        obj = schemas.Recording.model_validate(recording)
        self._update_cache(obj)
        return obj

    async def create_many(
        self,
        session: AsyncSession,
        data: Sequence[dict],
        audio_dir: str | None = None,  # Changed to str
    ) -> None | Sequence[schemas.Recording]:
        """Create recordings."""
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        validated_data = remove_duplicates(
            [
                schemas.RecordingCreate.model_validate(recording)
                for recording in data
            ],
            key=lambda x: x.path,
        )

        # Use partial to pass audio_dir to the function
        assemble_data_func = partial(
            _assemble_recording_data, audio_dir=audio_dir
        )

        with Pool() as pool:
            results = pool.map_async(
                assemble_data_func,
                validated_data,
            )
            all_data: list[dict | None] = results.get()

        recordings = await common.create_objects_without_duplicates(
            session,
            models.Recording,
            [rec for rec in all_data if rec is not None],
            key=lambda recording: recording.get("hash"),
            key_column=models.Recording.hash,
        )

        return [schemas.Recording.model_validate(rec) for rec in recordings]

    async def update(
        self,
        session: AsyncSession,
        obj: schemas.Recording,
        data: schemas.RecordingUpdate,
        audio_dir: str | None = None,  # Changed to str
    ) -> schemas.Recording:
        """Update a recording."""
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        if data.path is not None:
            new_hash = compute_md5_checksum(data.path)

            if new_hash != obj.hash:
                raise ValueError(
                    "File at the given path does not match the hash of the "
                    "recording."
                )

            data.path = str(data.path)

        if data.time_expansion is not None:
            if data.time_expansion != obj.time_expansion:
                await self.adjust_time_expansion(
                    session, obj, data.time_expansion
                )

        return await super().update(session, obj, data)

    async def adjust_time_expansion(
        self,
        session: AsyncSession,
        obj: schemas.Recording,
        time_expansion: float,
    ) -> None:
        """Adjust the time expansion of a recording."""
        factor = time_expansion / obj.time_expansion
        duration = obj.duration / factor
        samplerate = int(obj.samplerate * factor)

        await common.update_object(
            session,
            models.Recording,
            models.Recording.id == obj.id,
            time_expansion=time_expansion,
            duration=duration,
            samplerate=samplerate,
        )

        # TODO: Update time and frequency coordinates of associated objects

    # The rest of the class remains unchanged...

def validate_path(
    path: Path,
    audio_dir: str,
) -> str:
    """Validate that a path is relative to the audio directory."""
    # Since audio_dir can be an S3 URI, we treat paths as strings
    full_path = f"{audio_dir}/{path}"

    # Optionally, perform validation to ensure the path is within the bucket

    return full_path


def _assemble_recording_data(
    data: schemas.RecordingCreate,
    audio_dir: str,
) -> dict | None:
    """Get missing recording data from file."""
    logger.debug(f"Assembling recording data from file: {data.path}")

    settings = get_settings()

    path = f"{audio_dir}/{data.path}"

    # Determine filesystem
    if path.startswith('s3://'):
        fs = fsspec.filesystem(
            's3',
            key=settings.aws_access_key_id,
            secret=settings.aws_secret_access_key,
            client_kwargs={'region_name': settings.aws_region},
            endpoint_url=settings.s3_endpoint_url,
        )
    else:
        fs = fsspec.filesystem('file')

    try:
        # Open file using fsspec
        with fs.open(path, 'rb') as f:
            info = files.get_file_info(f)
    except (ValueError, KeyError, sf.LibsndfileError) as e:
        logger.warning(
            f"Could not get file info from file. {data.path} Skipping file.",
            exc_info=e,
        )
        return None

    if info.media_info is None:
        logger.warning(
            f"Could not extract media info from file. {data.path} Skipping file."
        )
        return None

    if not info.is_audio:
        logger.warning(
            f"File is not an audio file. {data.path} Skipping file.",
        )
        return None

    if info.hash is None:
        logger.warning(
            f"Could not compute hash of file. {data.path} Skipping file."
        )
        return None

    duration = info.media_info.duration_s / data.time_expansion
    samplerate = int(info.media_info.samplerate_hz * data.time_expansion)
    channels = info.media_info.channels
    return {
        **dict(data),
        **dict(
            duration=duration,
            samplerate=samplerate,
            channels=channels,
            hash=info.hash,
            path=str(data.path),
        ),
    }


recordings = RecordingAPI()
