"""Sound Event Prediction model.

A sound event prediction is a sound event that has been identified by the
machine learning model or an annotator during the evaluation of a clip in a
prediction run. The model assigns a confidence score to each predicted sound
event to indicate its confidence in the presence of the event in the clip. In
addition, each sound event prediction can have multiple tags associated with
it, and each tag has its own probability score reflecting the confidence of the
model that the tag is relevant to the event.
"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.clip_prediction import ClipPrediction
from whombat.models.sound_event import SoundEvent

__all__ = [
    "SoundEventPrediction",
    "SoundEventPredictionTag",
]


class SoundEventPrediction(Base):
    """Predicted Sound Event model."""

    __tablename__ = "sound_event_prediction"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Unique identifier of the sound event prediction."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """Unique identifier of the sound event."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship()
    """Sound event to which the sound event prediction belongs."""

    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
        nullable=False,
    )
    """Unique identifier of the clip prediction."""

    clip_prediction: orm.Mapped[ClipPrediction] = orm.relationship()
    """Processed clip to which the sound event prediction belongs."""

    score: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
    )
    """Confidence score assigned to the sound event prediction by the model."""

    predicted_tags: orm.Mapped[
        list["SoundEventPredictionTag"]
    ] = orm.relationship(
        "SoundEventPredictionTag",
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )
    """Predicted tags associated with the sound event prediction."""

    __table_args__ = (
        UniqueConstraint(
            "sound_event_id",
            "clip_prediction_id",
        ),
    )


class SoundEventPredictionTag(Base):
    """Sound Event Prediction Tag model."""

    __tablename__ = "sound_event_prediction_tag"

    sound_event_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event_prediction.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the sound event prediction."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the tag."""

    score: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
        default=1.0,
    )
    """Confidence score of the predicted tag."""

    __table_args__ = (
        UniqueConstraint(
            "sound_event_prediction_id",
            "tag_id",
        ),
    )
