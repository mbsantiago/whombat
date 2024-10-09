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
    """Sound Event Evaluation.

    Represents the evaluation of a predicted sound event against a ground truth
    annotation.

    This class stores the results of comparing a predicted sound event (from a
    model or user) to a corresponding annotated sound event (ground truth). It
    includes various metrics and scores to quantify the accuracy of the
    prediction.
    """

    __tablename__ = "sound_event_evaluation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the sound event evaluation."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    """A unique UUID for the sound event evaluation."""

    clip_evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_evaluation.id"),
        nullable=False,
    )
    """The ID of the clip evaluation to which this evaluation belongs."""

    source_id: orm.Mapped[int | None] = orm.mapped_column(
        ForeignKey("sound_event_prediction.id"),
        nullable=True,
    )
    """The id of the predicted sound event."""

    target_id: orm.Mapped[int | None] = orm.mapped_column(
        ForeignKey("sound_event_annotation.id"),
        nullable=True,
    )
    """The ID of the target (ground truth) sound event annotation."""

    affinity: orm.Mapped[float]
    """The affinity score between the prediction and the ground truth.

    This score measures the geometric similarity between the predicted 
    and true sound event regions, without considering semantic information.
    """

    score: orm.Mapped[float]
    """The overall score of the match between prediction and ground truth."""

    # Relationships
    source: orm.Mapped[Optional[SoundEventPrediction]] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The predicted sound event object."""

    target: orm.Mapped[Optional[SoundEventAnnotation]] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The target (ground truth) sound event annotation object."""

    metrics: orm.Mapped[list["SoundEventEvaluationMetric"]] = orm.relationship(
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )
    """A list of metrics associated with this sound event evaluation."""

    # Backrefs
    clip_evaluation: orm.Mapped["ClipEvaluation"] = orm.relationship(
        back_populates="sound_event_evaluations",
        init=False,
        repr=False,
    )


class SoundEventEvaluationMetric(Base):
    """Sound Event Evaluation Metric model.

    Represents a specific metric used to evaluate a sound event prediction.

    This class stores the value of a single evaluation metric
    (e.g., precision, recall, F1-score) calculated for a
    SoundEventEvaluation. It links the metric value to its name
    (stored in the FeatureName table) and the corresponding evaluation.
    """

    __tablename__ = "sound_event_evaluation_metric"
    __table_args__ = (
        UniqueConstraint(
            "sound_event_evaluation_id",
            "feature_name_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database ID of the metric."""

    sound_event_evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event_evaluation.id"),
        nullable=False,
    )
    """The ID of the sound event evaluation to which this metric belongs."""

    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id"),
        nullable=False,
    )
    """The ID of the feature name associated with this metric."""

    value: orm.Mapped[float] = orm.mapped_column(
        nullable=False,
    )
    """The value of the metric."""

    name: AssociationProxy[str] = association_proxy(
        "feature_name",
        "name",
        init=False,
    )
    """The name of the metric (accessed via the FeatureName relationship)."""

    # Relations
    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The FeatureName object associated with this metric."""

    sound_event_evaluation: orm.Mapped[SoundEventEvaluation] = (
        orm.relationship(
            back_populates="metrics",
            init=False,
            repr=False,
        )
    )
    """The SoundEventEvaluation object to which this metric belongs."""
