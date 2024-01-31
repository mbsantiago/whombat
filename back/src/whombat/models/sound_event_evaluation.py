"""Evaluated Sound Event model."""

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy

from whombat.models.base import Base
from whombat.models.feature import FeatureName
from whombat.models.sound_event_annotation import SoundEventAnnotation
from whombat.models.sound_event_prediction import SoundEventPrediction

if TYPE_CHECKING:
    from whombat.models.clip_evaluation import ClipEvaluation

__all__ = [
    "SoundEventEvaluation",
    "SoundEventEvaluationMetric",
]


class SoundEventEvaluation(Base):
    """Evaluated Sound Event model.

    Attributes
    ----------
    id
        The database id of the sound event evaluation.
    uuid
        The UUID of the sound event evaluation.
    source
        The sound event prediction to which the sound event evaluation belongs.
    target
        The sound event annotation to which the sound event evaluation belongs.
    affinity
        The affinity between the sound event prediction geometry and the sound
        event annotation geometry. Does not take into account any semantic
        information.
    score
        The overall score of the sound event evaluation.
    metrics
        A list of metrics associated with the sound event evaluation.

    Parameters
    ----------
    clip_evaluation_id : int
        The id of the clip evaluation to which the sound event evaluation
        belongs.
    source_id : int, optional
        The id of the sound event prediction to which the sound event
        evaluation belongs.
    target_id : int, optional
        The id of the sound event annotation to which the sound event
        evaluation belongs.
    affinity : float
        The affinity between the sound event prediction geometry and the sound
        event annotation geometry. Does not take into account any semantic
        information.
    score : float
        The overall score of the sound event evaluation.
    uuid : UUID, optional
        The UUID of the sound event evaluation. If not provided, a new UUID
        will be generated.
    """

    __tablename__ = "sound_event_evaluation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    clip_evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_evaluation.id"),
        nullable=False,
    )
    source_id: orm.Mapped[int | None] = orm.mapped_column(
        ForeignKey("sound_event_prediction.id"),
        nullable=True,
    )
    target_id: orm.Mapped[int | None] = orm.mapped_column(
        ForeignKey("sound_event_annotation.id"),
        nullable=True,
    )
    affinity: orm.Mapped[float]
    score: orm.Mapped[float]

    # Relationships
    source: orm.Mapped[Optional[SoundEventPrediction]] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    target: orm.Mapped[Optional[SoundEventAnnotation]] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    metrics: orm.Mapped[list["SoundEventEvaluationMetric"]] = orm.relationship(
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )

    # Backrefs
    clip_evaluation: orm.Mapped["ClipEvaluation"] = orm.relationship(
        back_populates="sound_event_evaluations",
        init=False,
        repr=False,
    )


class SoundEventEvaluationMetric(Base):
    """Sound Event Evaluation Metric model.

    Attributes
    ----------
    feature_name
        The name of the feature.
    value
        The value of the feature.

    Parameters
    ----------
    sound_event_evaluation_id : int
        The id of the sound event evaluation to which the metric belongs.
    feature_name_id : int
        The id of the name of the feature.
    value : float
        The value of the feature.
    """

    __tablename__ = "sound_event_evaluation_metric"
    __table_args__ = (
        UniqueConstraint(
            "sound_event_evaluation_id",
            "feature_name_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    sound_event_evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event_evaluation.id"),
        nullable=False,
    )
    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id"),
        nullable=False,
    )
    value: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
    )
    name: AssociationProxy[str] = association_proxy(
        "feature_name",
        "name",
        init=False,
    )

    # Relations
    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    sound_event_evaluation: orm.Mapped[SoundEventEvaluation] = (
        orm.relationship(
            back_populates="metrics",
            init=False,
            repr=False,
        )
    )
