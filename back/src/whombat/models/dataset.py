"""Dataset model.

A dataset is a collection of audio recordings that are grouped together
within a single directory. The purpose of a dataset is to organize and
group recordings that belong together, such as all recordings from a
single deployment or field study. Usually, recordings within a dataset
are made by the same group of people, using similar equipment, and
following a predefined protocol. However, this is not a strict
requirement.

Each dataset can be named and described, making it easier to identify
and manage multiple datasets within the app. Users can add new datasets
to the app and import recordings into them, or remove datasets and their
associated recordings from the app.
"""

from pathlib import Path
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint, func, inspect, select

from whombat.models.base import Base
from whombat.models.recording import Recording

__all__ = [
    "Dataset",
    "DatasetRecording",
]


class Dataset(Base):
    """Dataset model for dataset table.

    This model represents the dataset table in the database.

    Attributes
    ----------
    id
        The database id of the dataset.
    uuid
        The UUID of the dataset.
    name
        The name of the dataset.
    description
        A textual description of the dataset.
    audio_dir
        The path to the audio directory of the dataset.
    created_on
        The date and time the dataset was created.
    recording_count
        The number of recordings associated with the dataset.

    Parameters
    ----------
    name : str
        The name of the dataset.
    description : str, optional
        A textual description of the dataset.
    audio_dir : Path
        The path to the audio directory of the dataset.
    uuid : UUID, optional
        The UUID of the dataset. If not provided, a new UUID will be
        generated.

    Notes
    -----
    The audio_dir attribute is the path to the audio directory of the dataset.
    This is the directory that contains all the recordings of the dataset. Only
    the relative path to the base audio directory is stored in the database.
    Note that we should NEVER store absolute paths in the database.
    """

    __tablename__ = "dataset"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    name: orm.Mapped[str] = orm.mapped_column(unique=True)
    description: orm.Mapped[str] = orm.mapped_column(nullable=True)
    audio_dir: orm.Mapped[Path] = orm.mapped_column(unique=True)

    # Relations
    recordings: orm.Mapped[list[Recording]] = orm.relationship(
        "Recording",
        secondary="dataset_recording",
        viewonly=True,
        default_factory=list,
        repr=False,
        init=False,
    )

    # Secondary relations
    dataset_recordings: orm.Mapped[list["DatasetRecording"]] = (
        orm.relationship(
            "DatasetRecording",
            init=False,
            repr=False,
            back_populates="dataset",
            cascade="all, delete-orphan",
            default_factory=list,
        )
    )


class DatasetRecording(Base):
    """Dataset Recording Model.

    A dataset recording is a link between a dataset and a recording. It
    contains the path to the recording within the dataset.

    Attributes
    ----------
    path
        The path to the recording within the dataset.
    recording
        The recording.
    created_on
        The date and time the dataset recording was created.

    Parameters
    ----------
    dataset_id : int
        The id of the dataset.
    recording_id : int
        The id of the recording.


    Notes
    -----
    The dataset recording model is a many-to-many relationship between the
    dataset and recording models. This means that a recording can be part of
    multiple datasets. This is useful when a recording is used in multiple
    studies or deployments. However, as we do not want to duplicate recordings
    in the database, we use a many-to-many relationship to link recordings to
    datasets.
    """

    __tablename__ = "dataset_recording"
    __table_args__ = (UniqueConstraint("dataset_id", "recording_id", "path"),)

    dataset_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("dataset.id"),
        nullable=False,
        primary_key=True,
    )
    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
        primary_key=True,
    )
    path: orm.Mapped[Path]

    # Relations
    dataset: orm.Mapped[Dataset] = orm.relationship(
        init=False,
        repr=False,
        back_populates="dataset_recordings",
    )
    recording: orm.Mapped[Recording] = orm.relationship(
        Recording,
        init=False,
        repr=False,
        lazy="joined",
        back_populates="recording_datasets",
        cascade="all",
    )


# Add a property to the Dataset model that returns the number of recordings
# associated with the dataset.
inspect(Dataset).add_property(
    "recording_count",
    orm.column_property(
        select(func.count(DatasetRecording.recording_id))
        .where(DatasetRecording.dataset_id == Dataset.id)
        .correlate_except(DatasetRecording)
        .scalar_subquery(),
        deferred=False,
    ),
)
