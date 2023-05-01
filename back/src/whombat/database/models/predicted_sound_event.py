"""Predicted Sound Event model.

A predicted sound event is a sound event that has been identified by the
machine learning model during the processing of a clip in a model run. The
model assigns a probability score to each predicted sound event to indicate its
confidence in the presence of the event in the clip. In addition, each
predicted sound event can have multiple predicted tags associated with it, and
each tag has its own probability score reflecting the confidence of the model
that the tag is relevant to the event.

"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.base import Base
from whombat.database.models.processed_clip import ProcessedClip
from whombat.database.models.sound_event import SoundEvent

__all__ = [
    "PredictedSoundEvent",
    "PredictedSoundEventPredictedTag",
]


class PredictedSoundEvent(Base):
    """Predicted Sound Event model."""

    __tablename__ = "predicted_sound_event"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Unique identifier of the predicted sound event."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """Unique identifier of the sound event."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship()
    """Sound event to which the predicted sound event belongs."""

    processed_clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("processed_clip.id"),
        nullable=False,
    )
    """Unique identifier of the processed clip."""

    processed_clip: orm.Mapped[ProcessedClip] = orm.relationship()
    """Processed clip to which the predicted sound event belongs."""

    probability: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
    )
    """Probability score assigned to the predicted sound event by the model."""

    predicted_tags: orm.Mapped[
        "PredictedSoundEventPredictedTag"
    ] = orm.relationship(
        "PredictedSoundEventPredictedTag",
        cascade="all, delete-orphan",
    )
    """Predicted tags associated with the predicted sound event."""

    __table_args__ = (
        UniqueConstraint(
            "sound_event_id",
            "processed_clip_id",
        ),
    )


class PredictedSoundEventPredictedTag(Base):
    """Predicted sound event predicted tag model."""

    __tablename__ = "predicted_sound_event_predicted_tag"

    predicted_sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("predicted_sound_event.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the predicted sound event."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        primary_key=True,
        nullable=False,
    )
    """Unique identifier of the tag."""

    probability: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
        default=1.0,
    )
    """Probability of the predicted tag."""

    __table_args__ = (
        UniqueConstraint(
            "predicted_sound_event_id",
            "tag_id",
        ),
    )
