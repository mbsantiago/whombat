"""Training set model.

A training set is an essential tool for novice annotators to learn how to
accurately identify and label sound events. A training set is a collection of
annotated sound events that serve as ground truth for learning purposes. Users
can create a training set from any annotated sound event, such as by selecting
all sound events with particular tags or species.

Once a training set is created, users can start a training session where they
are presented with a sound event and asked to select the correct tag or label
for the sound event. This type of training session can help users identify
which sound events they can confidently identify and which ones require more
attention. Additionally, users can repeat the training session as many times as
needed to improve their accuracy and confidence in identifying different sound
events.

A well-designed training set can improve the accuracy and consistency of the
annotations in an annotation project, leading to better machine learning models
and more accurate results.
"""


import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.base import Base
from whombat.database.models.sound_event import SoundEvent
from whombat.database.models.tag import Tag

__all__ = [
    "TrainingSet",
    "TrainingSetTag",
]


class TrainingSet(Base):
    """Training Set model."""

    __tablename__ = "training_set"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Training set ID."""

    name: orm.Mapped[str] = orm.mapped_column(nullable=False, unique=True)
    """Training set name."""

    description: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """Training set description."""

    tags: orm.Mapped[list[Tag]] = orm.relationship(
        "Tag",
        secondary="training_set_tag",
    )
    """Training set tags.

    Only these tags will be used during training sessions.
    """

    sound_events: orm.Mapped[list[SoundEvent]] = orm.relationship(
        "SoundEvent",
        secondary="training_sound_event",
    )
    """Training set sound events."""


class TrainingSetTag(Base):
    """Training Set Tag model."""

    __tablename__ = "training_set_tag"

    training_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("training_set.id"),
        nullable=False,
        primary_key=True,
    )
    """Training set ID."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
        primary_key=True,
    )
    """Tag ID."""

    __table_args__ = (UniqueConstraint("training_set_id", "tag_id"),)
