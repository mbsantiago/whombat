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
    """Prediction Clip model.

    Attributes
    ----------
    id
        The database id of the clip prediction.
    uuid
        The UUID of the clip prediction.
    clip
        The clip to which the prediction belongs.
    tags
        A list of predicted tags.
    sound_events
        A list of predicted sound events.
    created_on
        The date and time the clip prediction was created.

    Parameters
    ----------
    clip_id : int
        The database id of the clip to which the prediction belongs.
    uuid : UUID, optional
        The UUID of the clip prediction.
    """

    __tablename__ = "clip_prediction"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
    )

    # Relations
    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        lazy="joined",
        repr=False,
    )
    tags: orm.Mapped[list["ClipPredictionTag"]] = orm.relationship(
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )
    sound_events: orm.Mapped[list[SoundEventPrediction]] = orm.relationship(
        back_populates="clip_prediction",
        cascade="all, delete-orphan",
        lazy="selectin",
        init=False,
        repr=False,
        default_factory=list,
    )


class ClipPredictionTag(Base):
    """Clip Prediction Tag model.

    Attributes
    ----------
    id
        The database id of the clip prediction tag.
    tag
        The predicted tag.
    score
        The confidence score of the prediction.

    Parameters
    ----------
    clip_prediction_id : int
        The database id of the clip prediction.
    tag_id : int
        The database id of the tag.
    score : float
        The confidence score of the prediction.
    """

    __tablename__ = "clip_prediction_tag"
    __table_args__ = (
        UniqueConstraint(
            "clip_prediction_id",
            "tag_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
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

    # Relations
    tag: orm.Mapped[Tag] = orm.relationship(
        back_populates="clip_prediction_tags",
        init=False,
        repr=False,
        lazy="joined",
    )
