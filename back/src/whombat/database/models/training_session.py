"""Training Session model.

A training session is a practice session in which an annotator can test
their ability to correctly identify sound events based on the training set.
During a training session, the user is presented with a set of sound events
from the training set and is asked to select the correct tags for each
event. The system will provide feedback on the user's accuracy and
performance, such as the number of correct and incorrect answers, and the
time taken to complete the session. This feedback can help the user to
understand their strengths and weaknesses in identifying sound events and
can guide them towards further training or improvement. Any number of
training sessions can be conducted on the same training set to improve the
user's performance and build their confidence in identifying sound events
accurately.

"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey

from whombat.database.models.base import Base


__all__ = [
    "TrainingSession",
]


class TrainingSession(Base):
    """Training Session model."""

    __tablename__ = "training_session"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Training session ID."""

    training_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("training_set.id"),
        nullable=False,
    )
    """Training set ID."""

    taken_by_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=False,
    )
    """User ID of the user who took the training session."""
