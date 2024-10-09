"""Sound Event Prediction model.

A sound event prediction is a sound event that has been identified by
the machine learning model or an annotator during the evaluation of a
clip in a prediction run. The model assigns a confidence score to each
predicted sound event to indicate its confidence in the presence of the
event in the clip. In addition, each sound event prediction can have
multiple tags associated with it, and each tag has its own probability
score reflecting the confidence of the model that the tag is relevant to
the event.
"""

from typing import TYPE_CHECKING
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.sound_event import SoundEvent
from whombat.models.tag import Tag

if TYPE_CHECKING:
    from whombat.models.clip_prediction import ClipPrediction


__all__ = [
    "SoundEventPrediction",
    "SoundEventPredictionTag",
]


class SoundEventPrediction(Base):
    """Predicted Sound Event model."""

    __tablename__ = "sound_event_prediction"
    __table_args__ = (
        UniqueConstraint(
            "sound_event_id",
            "clip_prediction_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The database id of the sound event prediction."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    """The UUID of the sound event prediction."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """The database id of the predicted sound event."""

    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
        nullable=False,
    )
    """The database id of the clip prediction to which the sound event belongs."""

    score: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
    )
    """The confidence score assigned to the sound event prediction.

    The confidence score assigned to the sound event prediction reflects the
    model's confidence in the presence and location of the sound event, but not
    in its identification. The individual score in each predicted tag provides
    the confidence in the identification.
    """

    # Relations
    sound_event: orm.Mapped[SoundEvent] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
        cascade="all, delete-orphan",
        single_parent=True,
    )
    """The sound event being predicted."""

    clip_prediction: orm.Mapped["ClipPrediction"] = orm.relationship(
        back_populates="sound_events",
        init=False,
        repr=False,
    )
    """The clip prediction to which the sound event prediction belongs."""

    tags: orm.Mapped[list["SoundEventPredictionTag"]] = orm.relationship(
        "SoundEventPredictionTag",
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )
    """The tags associated with the sound event prediction."""


class SoundEventPredictionTag(Base):
    """Sound Event Prediction Tag model."""

    __tablename__ = "sound_event_prediction_tag"
    __table_args__ = (
        UniqueConstraint(
            "sound_event_prediction_id",
            "tag_id",
        ),
    )

    sound_event_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event_prediction.id"),
        primary_key=True,
        nullable=False,
    )
    """The database id of the sound event prediction associated with the"""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        primary_key=True,
        nullable=False,
    )
    """The database id of the tag associated with the sound event."""

    score: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
        default=1.0,
    )
    """The confidence score assigned to the tag."""

    tag: orm.Mapped[Tag] = orm.relationship(
        back_populates="sound_event_prediction_tags",
        lazy="joined",
        init=False,
        repr=False,
    )
    """The tag associated with the sound event prediction."""
