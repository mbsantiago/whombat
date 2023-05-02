"""Training sound event model.

A training sound event is a specific sound event that is included
in a training set. This set of sound events is used to help novice
annotators learn how to identify and correctly label different
sound events. Each training sound event has been previously
annotated with at least one tag, which serves as the "correct
answer" for the training exercise. When a user is completing a
training session, they will be presented with a training sound
event and asked to correctly identify the associated tag(s).

Training sound events can have multiple tags associated with them,
but during training sessions, the focus is typically on a subset of
these tags. For example, if a training set includes sound events
related to bird species, the training session might only focus on
identifying the species name, while other tags related to the
location or behavior of the bird might not be included.

It is important to have a diverse set of training sound events for
each target class in order to provide a representative sample of
the range of sound events that the annotator might encounter in the
wild. Additionally, it is recommended to balance the number of
training sound events per class to avoid biases towards certain
classes. By providing a robust and varied training set, novice
annotators can quickly learn how to identify and label sound events
accurately and consistently.
"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.base import Base
from whombat.database.models.sound_event import SoundEvent


class TrainingSoundEvent(Base):
    """Training Sound Event model."""

    __tablename__ = "training_sound_event"

    training_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("training_set.id"),
        nullable=False,
        primary_key=True,
    )
    """Training set ID."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
        primary_key=True,
    )
    """Sound event ID."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship(
        "SoundEvent",
        backref="training_sound_events",
    )
    """Sound event."""

    __table_args__ = (
        UniqueConstraint(
            "training_set_id",
            "sound_event_id",
        ),
    )
