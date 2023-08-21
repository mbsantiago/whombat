"""Dataset model.

A dataset is a collection of audio recordings that are grouped together within
a single directory. The purpose of a dataset is to organize and group
recordings that belong together, such as all recordings from a single
deployment or field study. Usually, recordings within a dataset are made by the
same group of people, using similar equipment, and following a predefined
protocol. However, this is not a strict requirement.

Each dataset can be named and described, making it easier to identify and
manage multiple datasets within the app. Users can add new datasets to the app
and import recordings into them, or remove datasets and their associated
recordings from the app.

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

    """

    __tablename__ = "dataset"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The id of the dataset."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4, unique=True, kw_only=True
    )
    """The UUID of the dataset."""

    name: orm.Mapped[str] = orm.mapped_column(unique=True)
    """The name of the dataset."""

    description: orm.Mapped[str] = orm.mapped_column(nullable=True)
    """The description of the dataset."""

    audio_dir: orm.Mapped[Path] = orm.mapped_column(unique=True)
    """The path to the audio directory of the dataset.

    This is the directory that contains all the recordings of the dataset. Only
    the relative path to the base audio directory is stored in the database.

    Notes
    -----
    Should NEVER store absolute paths in the database.
    """

    dataset_recordings: orm.Mapped[
        list["DatasetRecording"]
    ] = orm.relationship(
        "DatasetRecording",
        init=False,
        repr=False,
        back_populates="dataset",
        cascade="all, delete-orphan",
        default_factory=list,
    )


class DatasetRecording(Base):
    """Dataset Recording Model.

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

    dataset_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("dataset.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the dataset."""

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the recording."""

    path: orm.Mapped[Path]
    """The path to the recording within the dataset.

    This path is relative to the dataset's audio directory.
    """

    dataset: orm.Mapped[Dataset] = orm.relationship(
        init=False,
        repr=False,
        back_populates="dataset_recordings",
        cascade="all",
    )
    """The dataset."""

    recording: orm.Mapped[Recording] = orm.relationship(
        Recording,
        init=False,
        repr=False,
        lazy="joined",
        back_populates="recording_datasets",
        cascade="all",
    )
    """The recording."""

    __table_args__ = (UniqueConstraint("dataset_id", "recording_id", "path"),)


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
