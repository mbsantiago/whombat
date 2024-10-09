"""Clip Prediction Model."""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.clip import Clip
from whombat.models.sound_event_prediction import SoundEventPrediction
from whombat.models.tag import Tag

__all__ = [
    "ClipPrediction",
    "ClipPredictionTag",
]


class ClipPrediction(Base):
    """Prediction Clip model."""

    __tablename__ = "clip_prediction"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The database id of the clip prediction."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    """The UUID of the clip prediction."""

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
    )
    """The database id of the clip to which the prediction belongs."""

    # Relations
    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        lazy="joined",
        repr=False,
    )
    """The clip over which the predictions were made."""

    tags: orm.Mapped[list["ClipPredictionTag"]] = orm.relationship(
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )
    """The list of predicted tags for the clip."""

    sound_events: orm.Mapped[list[SoundEventPrediction]] = orm.relationship(
        back_populates="clip_prediction",
        cascade="all, delete-orphan",
        lazy="selectin",
        init=False,
        repr=False,
        default_factory=list,
    )
    """The list of predicted sound events within the clip."""


class ClipPredictionTag(Base):
    """Clip Prediction Tag model."""

    __tablename__ = "clip_prediction_tag"
    __table_args__ = (
        UniqueConstraint(
            "clip_prediction_id",
            "tag_id",
        ),
    )

    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
        primary_key=True,
        nullable=False,
    )
    """The database id of the clip prediction associated with the tag."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        primary_key=True,
        nullable=False,
    )
    """The database id of the tag associated with the clip prediction."""

    score: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
        default=1.0,
    )
    """The confidence score of the prediction tag.

    The confidence score of the prediction tag represents the predictors's
    confidence in the assignment of this tag to the clip. The score is a number
    between 0 and 1, where 1 is the highest confidence and 0 is the lowest.
    """

    # Relations
    tag: orm.Mapped[Tag] = orm.relationship(
        back_populates="clip_prediction_tags",
        init=False,
        repr=False,
        lazy="joined",
    )
    """The tag associated with the clip prediction."""
