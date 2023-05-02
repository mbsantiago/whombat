"""Training Guess model.

A training guess is essentially the answer that the user provides during a
training session for a particular sound event in the training set. It
consists of the tags that the user thinks are associated with that sound
event. The user is typically presented with a sound event and a list of tags
to choose from. They then select the tag(s) that they think are correct and
submit their guess. The available tags are determined by the configuration
of the training set and can vary depending on the goals of the training.
Once the training guess is submitted, it can be used to evaluate the user's
performance and provide feedback on areas where they may need to improve
their understanding or labeling skills.

"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.base import Base
from whombat.database.models.sound_event import SoundEvent


class TrainingGuess(Base):
    """Training Guess model."""

    __tablename__ = "training_guess"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Training guess ID."""

    training_session_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("training_session.id"),
        nullable=False,
    )
    """Training session ID."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """Sound event ID."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship(
        "SoundEvent",
        backref="training_guesses",
    )
    """Sound event."""

    tags: orm.Mapped[list[str]] = orm.mapped_column(nullable=False)
    """Tags selected by the user for the sound event."""

    score: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """Score for the training guess.

    The score is calculated based on the number of correct tags selected by
    the user for the sound event. The score is a value between 0 and 1,
    where 0 indicates that no correct tags were selected and 1 indicates
    that all correct tags were selected.

    """

    __table_args__ = (
        UniqueConstraint(
            "training_session_id",
            "sound_event_id",
            name="unique_training_guess",
        ),
    )