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
    """Predicted Sound Event model.

    Attributes
    ----------
    id
        The database id of the sound event prediction.
    uuid
        The UUID of the sound event prediction.
    sound_event
        The sound event to which the sound event prediction belongs.
    score
        The confidence score assigned to the sound event prediction by the
        model.
    tags
        A list of predicted tags associated with the sound event prediction.
    created_on
        The date and time when the sound event prediction was created.

    Parameters
    ----------
    sound_event_id : int
        The id of the sound event to which the sound event prediction
        belongs.
    clip_prediction_id : int
        The id of the clip prediction to which the sound event prediction
        belongs.
    score : float
        The confidence score assigned to the sound event prediction by the
        model.
    uuid : UUID, optional
        The UUID of the sound event prediction. If not provided, a new UUID
        will be generated.
    """

    __tablename__ = "sound_event_prediction"
    __table_args__ = (
        UniqueConstraint(
            "sound_event_id",
            "clip_prediction_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
        nullable=False,
    )
    score: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
    )

    # Relations
    sound_event: orm.Mapped[SoundEvent] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
        cascade="all, delete-orphan",
        single_parent=True,
    )
    clip_prediction: orm.Mapped["ClipPrediction"] = orm.relationship(
        back_populates="sound_events",
        init=False,
        repr=False,
    )
    tags: orm.Mapped[list["SoundEventPredictionTag"]] = orm.relationship(
        "SoundEventPredictionTag",
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )


class SoundEventPredictionTag(Base):
    """Sound Event Prediction Tag model.

    Attributes
    ----------
    tag
        The tag associated with the sound event prediction.
    score
        The confidence score assigned to the tag by the model.
    created_on
        The date and time when the tag was created.

    Parameters
    ----------
    sound_event_prediction_id : int
        The id of the sound event prediction to which the tag belongs.
    tag_id : int
        The id of the tag associated with the sound event prediction.
    score : float
        The confidence score assigned to the tag by the model.
    """

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
    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        primary_key=True,
        nullable=False,
    )
    score: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
        default=1.0,
    )
    tag: orm.Mapped[Tag] = orm.relationship(
        back_populates="sound_event_prediction_tags",
        lazy="joined",
        init=False,
        repr=False,
    )
