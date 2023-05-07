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

from uuid import UUID, uuid4

import sqlalchemy.orm as orm

from whombat.database.models.base import Base

__all__ = [
    "Dataset",
]


class Dataset(Base):
    """Dataset model for dataset table.

    This model represents the dataset table in the database.

    """

    __tablename__ = "dataset"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The id of the dataset."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(default=uuid4, unique=True)
    """The UUID of the dataset."""

    name: orm.Mapped[str] = orm.mapped_column(nullable=False, unique=True)
    """The name of the dataset."""

    description: orm.Mapped[str] = orm.mapped_column(nullable=True)
    """The description of the dataset."""

    audio_dir: orm.Mapped[str] = orm.mapped_column(nullable=False, unique=True)
    """The path to the audio directory of the dataset.

    This is the directory that contains all the recordings of the dataset.
    """
