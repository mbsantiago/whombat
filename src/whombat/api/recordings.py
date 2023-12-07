"""API functions for interacting with recordings."""
import datetime
import warnings
from functools import partial
from multiprocessing import Pool
from pathlib import Path
from typing import Sequence
from uuid import UUID

from soundevent import data
from soundevent.audio import compute_md5_checksum
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models, schemas
from whombat.api import common
from whombat.api.common import BaseAPI
from whombat.api.features import features
from whombat.api.notes import notes
from whombat.api.tags import tags
from whombat.api.users import users
from whombat.core import files
from whombat.core.common import remove_duplicates
from whombat.dependencies import get_settings

__all__ = [
    "RecordingAPI",
    "recordings",
]


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

    async def get_by_hash(
        self,
        session: AsyncSession,
        recording_hash: str,
    ) -> schemas.Recording:
        """Get a recording by hash.

        Parameters
        ----------
        session
            The database session to use.
        recording_hash
            The hash of the recording.

        Returns
        -------
        recording : schemas.recordings.Recording
            The recording.

        Raises
        ------
        NotFoundError
            If a recording with the given hash does not exist.
        """
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
        """Get a recording by path.

        Parameters
        ----------
        session
            The database session to use.
        recording_path
            The path of the recording.

        Returns
        -------
        recording : schemas.recordings.Recording
            The recording.

        Raises
        ------
        NotFoundError
            If a recording with the given path does not exist.
        """
        recording = await common.get_object(
            session,
            models.Recording,
            models.Recording.path == str(recording_path.absolute()),
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
        audio_dir: Path | None = None,
        **kwargs,
    ) -> schemas.Recording:
        """Create a recording.

        Parameters
        ----------
        session
            The database session to use.
        path
            The path to the audio file. This should be relative to the
            current working directory, or an absolute path.
        date
            The date of the recording.
        time
            The time of the recording.
        latitude
            The latitude of the recording site.
        longitude
            The longitude of the recording site.
        time_expansion
            Some recordings may be time expanded or time compressed. This
            value is the factor by which the recording is expanded or
            compressed. The default value is 1.0.
        rights
            A string describing the usage rights of the recording.
        audio_dir
            The root directory for audio files. If not given, it will
            default to the value of `settings.audio_dir`.
        **kwargs
            Additional keyword arguments to use when creating the recording,
            (e.g. `uuid` or `created_on`.)

        Returns
        -------
        recording : schemas.recordings.Recording
            The created recording.
        """
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
            recording_data,
            **kwargs,
        )

        return schemas.Recording.model_validate(recording)

    async def create_many(
        self,
        session: AsyncSession,
        data: Sequence[schemas.RecordingCreate],
        audio_dir: Path | None = None,
    ) -> None | Sequence[schemas.Recording]:
        """Create recordings.

        If you want to create a single recording, use `create_recording`.
        However if you want to create multiple recordings, it is more efficient
        to use this function.

        Parameters
        ----------
        session
            The database session to use.
        data
            The data to create the recordings with.
        audio_dir
            The root directory for audio files. If not given, it will
            default to the value of `settings.audio_dir`.

        Returns
        -------
        recordings : list[schemas.recordings.Recording]
            The created recordings.

        Notes
        -----
        This function will only create recordings for files that:
        - are audio files (according to `files.is_audio_file`)
        - media info can be extracted from it.
        - do not already exist in the database.

        Any files that do not meet these criteria will be silently ignored.
        """
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        data = remove_duplicates(
            [recording for recording in data],
            key=lambda x: x.path,
        )

        with Pool() as pool:
            results = pool.map_async(
                partial(_assemble_recording_data, audio_dir=audio_dir),
                data,
            )
            # Take at most 1 second per file on average
            # Some very large files may take longer, but this is a reasonable
            # estimate for most files.
            estimated_time = len(data)
            all_data: list[schemas.RecordingCreateFull | None] = results.get(
                timeout=estimated_time
            )

        recordings = await common.create_objects_without_duplicates(
            session,
            models.Recording,
            [rec for rec in all_data if rec is not None],
            key=lambda recording: recording.hash,
            key_column=models.Recording.hash,
        )

        return [schemas.Recording.model_validate(rec) for rec in recordings]

    async def update(
        self,
        session: AsyncSession,
        obj: schemas.Recording,
        data: schemas.RecordingUpdate,
        audio_dir: Path | None = None,
    ) -> schemas.Recording:
        """Update a recording.

        Parameters
        ----------
        session
            The database session to use.
        obj
            The recording to update.
        data
            The data to update the recording with.
        audio_dir
            The root directory for audio files. If not given, it will
            default to the value of `settings.audio_dir`.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.
        """
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        if data.path is not None:
            new_hash = compute_md5_checksum(data.path)

            if new_hash != obj.hash:
                raise ValueError(
                    "File at the given path does not match the hash of the "
                    "recording."
                )

            if not data.path.is_relative_to(audio_dir):
                raise ValueError(
                    "File is not in audio directory. "
                    f"\n\tFile:                 {data.path}. "
                    f"\n\tRoot audio directory: {audio_dir}"
                )

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
        """Adjust the time expansion of a recording.

        When the time expansion of a recording is adjusted several associated
        entities must be updated to reflect the new time expansion. Firstly
        the duration and samplerate of the recording must be updated. Secondly,
        the time and frequency coordinates of all associated objects must be
        updated.

        Parameters
        ----------
        obj
            The recording to adjust.
        time_expansion
            The new time expansion.
        """
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

        # TODO: Update time and frequency coordinates of associated objects:
        # - clips
        # - sound_events

    async def add_note(
        self,
        session: AsyncSession,
        recording_id: int,
        note_id: int,
    ) -> schemas.Recording:
        """Add a note to a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording.
        note_id
            The ID of the note.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.
        """
        recording = await common.add_note_to_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
            note_id,
        )
        return schemas.Recording.model_validate(recording)

    async def add_tag(
        self,
        session: AsyncSession,
        recording_id: int,
        tag_id: int,
    ) -> schemas.Recording:
        """Add a tag to a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to add the tag to.
        tag_id
            The ID of the tag to add.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given hash exists.

        Note
        ----
        The tag will only be added if it does not already exist.
        Otherwise it will be ignored.
        """
        recording = await common.add_tag_to_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
            tag_id,
        )

        return schemas.Recording.model_validate(recording)

    async def add_feature(
        self,
        session: AsyncSession,
        recording_id: int,
        feature_name_id: int,
        value: float,
    ) -> schemas.Recording:
        """Add a feature to a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to add the feature to.
        feature_name_id
            The ID of the feature name.
        value
            The value of the feature.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given hash exists.
        """
        recording = await common.add_feature_to_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
            feature_name_id,
            value,
        )
        return schemas.Recording.model_validate(recording)

    async def add_owner(
        self,
        session: AsyncSession,
        recording_id: int,
        owner_id: UUID,
    ) -> schemas.Recording:
        """Add an owner to a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to add the owner to.
        owner_id
            The ID of the owner to add.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given hash exists.

        Note
        ----
        The owner will only be added if it does not already exist.
        Otherwise it will be ignored.
        """
        recording = await common.get_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
        )

        for owner in recording.owners:
            if owner.id == owner_id:
                return schemas.Recording.model_validate(recording)

        user = await common.get_object(
            session,
            models.User,
            models.User.id == owner_id,
        )
        recording.owners.append(user)
        await session.flush()
        await session.refresh(recording)
        return schemas.Recording.model_validate(recording)

    async def update_feature(
        self,
        session: AsyncSession,
        recording_id: int,
        feature_name_id: int,
        value: float,
    ) -> schemas.Recording:
        """Update a feature of a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to update the feature of.
        feature_name_id
            The ID of the feature name.
        value
            The new value of the feature.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given hash exists.

        whombat.exceptions.NotFoundError
            If the recording does not have the given feature.
        """
        recording = await common.update_feature_on_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
            feature_name_id,
            value,
        )
        return schemas.Recording.model_validate(recording)

    async def remove_note(
        self,
        session: AsyncSession,
        recording_id: int,
        note_id: int,
    ):
        """Remove a note from a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to remove the note from.
        note_id
            The ID of the note to remove.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given id exists.

        Note
        ----
        The note will only be removed from the recording if it exists,
        otherwise it will be ignored.
        """
        recording = await common.remove_note_from_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
            note_id,
        )
        return schemas.Recording.model_validate(recording)

    async def remove_tag(
        self,
        session: AsyncSession,
        recording_id: int,
        tag_id: int,
    ) -> schemas.Recording:
        """Remove a tag from a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to remove the tag from.
        tag_id
            The ID of the tag to remove.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given id exists

        Note
        ----
        The tag will only be removed from the recording if it exists,
        otherwise it will be ignored.
        """
        recording = await common.remove_tag_from_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
            tag_id,
        )
        return schemas.Recording.model_validate(recording)

    async def remove_owner(
        self,
        session: AsyncSession,
        recording_id: int,
        owner_id: UUID,
    ) -> schemas.Recording:
        """Remove an owner from a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to remove the owner from.
        owner_id
            The ID of the owner to remove.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given id exists.

        Note
        ----
        The owner will only be removed from the recording if it exists,
        otherwise it will be ignored.
        """
        recording = await common.get_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
        )
        for owner in recording.owners:
            if owner.id == owner_id:
                recording.owners.remove(owner)
                break
        else:
            return schemas.Recording.model_validate(recording)

        await session.flush()
        await session.refresh(recording)
        return schemas.Recording.model_validate(recording)

    async def remove_feature(
        self,
        session: AsyncSession,
        recording_id: int,
        feature_name_id: int,
    ):
        """Remove a feature from a recording.

        Parameters
        ----------
        session
            The database session to use.
        recording_id
            The ID of the recording to remove the feature from.
        feature_name_id
            The ID of the feature to remove.

        Returns
        -------
        recording : schemas.recordings.Recording
            The updated recording.

        Raises
        ------
        whombat.exceptions.NotFoundError
            If no recording with the given id exists.

        Note
        ----
        The feature will only be removed from the recording if it exists,
        otherwise it will be ignored.
        """
        recording = await common.remove_feature_from_object(
            session,
            models.Recording,
            models.Recording.id == recording_id,
            feature_name_id,
        )
        return schemas.Recording.model_validate(recording)

    async def from_soundevent(
        self,
        session: AsyncSession,
        recording: data.Recording,
        audio_dir: Path | None = None,
    ) -> schemas.Recording:
        """Create a recording from a soundevent.Recording.

        Parameters
        ----------
        session
            The database session to use.
        recording
            The soundevent.Recording to create the recording from.
        audio_dir
            The root directory for audio files. If not given, it will
            default to the value of `settings.audio_dir`.

        Returns
        -------
        recording : schemas.recordings.Recording
            The created recording.
        """
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        data = schemas.RecordingCreate(
            uuid=recording.uuid,
            path=recording.path,
            time_expansion=recording.time_expansion,
            date=recording.date,
            time=recording.time,
            latitude=recording.latitude,
            longitude=recording.longitude,
        )

        created = await self.create_from_data(
            session,
            data,
        )

        for se_tag in recording.tags:
            tag = await tags.from_soundevent(session, se_tag)
            created = await self.add_tag(session, created.id, tag.id)

        for note in recording.notes:
            note = await notes.from_soundevent(session, note)
            created = await self.add_note(session, created.id, note.id)

        for feature in recording.features:
            feature = await features.from_soundevent(session, feature)
            created = await self.add_feature(
                session,
                created.id,
                feature.feature_name.id,
                feature.value,
            )

        return created

    def to_soundevent(
        self,
        recording: schemas.Recording,
        audio_dir: Path | None = None,
    ) -> data.Recording:
        """Create a soundevent.Recording from a recording.

        Parameters
        ----------
        recording
            The recording to create the soundevent.Recording from.
        audio_dir
            The root directory for audio files. If not given, it will
            default to the value of `settings.audio_dir`.

        Returns
        -------
        recording : soundevent.Recording
            The created soundevent.Recording.
        """
        if audio_dir is None:
            audio_dir = get_settings().audio_dir

        rec_tags = [tags.to_soundevent(tag) for tag in recording.tags]

        rec_notes = [notes.to_soundevent(note) for note in recording.notes]

        rec_features = [
            features.to_soundevent(feature) for feature in recording.features
        ]

        rec_owners = [users.to_soundevent(owner) for owner in recording.owners]

        return data.Recording(
            uuid=recording.uuid,
            path=audio_dir / recording.path,
            time_expansion=recording.time_expansion,
            channels=recording.channels,
            samplerate=recording.samplerate,
            duration=recording.duration,
            date=recording.date,
            time=recording.time,
            latitude=recording.latitude,
            longitude=recording.longitude,
            rights=recording.rights,
            tags=rec_tags,
            notes=rec_notes,
            features=rec_features,
            owners=rec_owners,
        )


def validate_path(
    path: Path,
    audio_dir: Path,
) -> Path:
    """Validate that a path is relative to the audio directory.

    Parameters
    ----------
    path
        The path to validate, can be absolute or relative. If absolute,
        it must be relative to the audio directory. If relative,
        it will be assumed to be relative to the audio directory and
        the file will be checked to exist.
    audio_dir
        The directory to check the path against.

    Returns
    -------
    path : Path
        The validated path.

    Raises
    ------
    ValueError
        If the path is not relative to the audio directory, or if the
        file does not exist.
    """
    if path.is_absolute():
        if not path.is_relative_to(audio_dir):
            raise ValueError(
                f"The path {path} is not relative to the audio directory "
                f"{audio_dir}."
            )
        path = path.relative_to(audio_dir)

    absolute_path = audio_dir / path
    if not absolute_path.is_file():
        raise ValueError(f"File {path} does not exist.")

    return path


def _assemble_recording_data(
    data: schemas.RecordingCreate,
    audio_dir: Path,
) -> schemas.RecordingCreateFull | None:
    """Get missing recording data from file."""
    info = files.get_file_info(data.path)

    if info.media_info is None:
        warnings.warn(
            f"Could not extract media info from file. {data.path}"
            "Skipping file.",
            UserWarning,
        )
        return None

    if not info.is_audio:
        warnings.warn(
            f"File is not an audio file. {data.path} Skipping file.",
            UserWarning,
        )
        return None

    if not data.path.is_relative_to(audio_dir):
        warnings.warn(
            f"File is not in audio directory. {data.path} Skipping file."
            f"Root audio directory: {audio_dir}",
            UserWarning,
        )
        return None

    if info.hash is None:
        warnings.warn(
            f"Could not compute hash of file. {data.path} Skipping file.",
            UserWarning,
        )
        return None

    duration = info.media_info.duration_s / data.time_expansion
    samplerate = int(info.media_info.samplerate_hz * data.time_expansion)
    channels = info.media_info.channels
    return schemas.RecordingCreateFull(
        **dict(data),
        duration=duration,
        samplerate=samplerate,
        channels=channels,
        hash=info.hash,
        path=data.path.relative_to(audio_dir),
    )


recordings = RecordingAPI()
