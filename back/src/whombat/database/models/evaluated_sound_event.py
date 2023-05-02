"""Evaluated Sound Event model.

An evaluated sound event is either a ground truth or predicted sound event that
is part of the evaluation of a model run. When evaluating the model's
performance, the predicted sound events are compared to the ground truth sound
events to determine if the model detected the correct sound events and if their
tags were correct. The evaluation also identifies ground truth sound events
that were missed by the model and false positive sound events that were
predicted by the model but were not present in the ground truth data. Each
matched ground truth and predicted sound event pair is kept as reference for
the evaluation.

"""

from sqlalchemy import ForeignKey, UniqueConstraint
import sqlalchemy.orm as orm

from whombat.database.models.base import Base


class EvaluatedSoundEvent(Base):
    """Evaluated Sound Event model."""

    __tablename__ = "evaluated_sound_event"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Evaluated sound event ID."""

    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        primary_key=True,
        nullable=False,
    )
    """Model Run ID."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        primary_key=True,
        nullable=False,
    )
    """Sound event ID."""

    is_ground_truth: orm.Mapped[bool] = orm.mapped_column(nullable=False)
    """Whether the sound event was ground truth."""

    is_prediction: orm.Mapped[bool] = orm.mapped_column(nullable=False)
    """Whether the sound event was predicted."""

    matched: orm.Mapped[bool] = orm.mapped_column(nullable=False)
    """Whether the sound event was matched."""

    match_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluated_sound_event.id"),
        nullable=True,
    )
    """Matched sound event ID."""

    __table_args__ = (
        UniqueConstraint(
            "evaluation_id",
            "sound_event_id",
        ),
    )
