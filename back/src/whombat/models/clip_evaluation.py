"""Evaluation Clip Model."""

from typing import TYPE_CHECKING
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy

from whombat.models.base import Base
from whombat.models.clip_annotation import ClipAnnotation
from whombat.models.clip_prediction import ClipPrediction
from whombat.models.feature import FeatureName
from whombat.models.sound_event_evaluation import SoundEventEvaluation

if TYPE_CHECKING:
    from whombat.models.evaluation import Evaluation

__all__ = [
    "ClipEvaluation",
    "ClipEvaluationMetric",
]


class ClipEvaluation(Base):
    """Clip Evaluation Model.

    Represents the evaluation of a clip-level prediction against ground truth.

    This class compares a prediction made on an audio clip to the corresponding
    ground truth annotation for that clip. It considers both clip-level tags
    and sound event predictions within the clip, providing an overall score and
    detailed metrics for the evaluation.
    """

    __tablename__ = "clip_evaluation"
    __table_args__ = (
        UniqueConstraint(
            "clip_annotation_id",
            "clip_prediction_id",
            "evaluation_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database ID of the clip evaluation."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    """A unique UUID for the clip evaluation."""

    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        nullable=False,
    )
    """The ID of the overall evaluation to which this clip evaluation belongs."""

    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id"),
        nullable=False,
    )
    """The ID of the ground truth clip annotation."""

    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
        nullable=False,
    )
    """The ID of the clip prediction."""

    score: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The overall score of the clip prediction."""

    # Relationships
    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        init=False,
        lazy="selectin",
    )
    """The ground truth clip annotation object."""

    clip_prediction: orm.Mapped[ClipPrediction] = orm.relationship(
        init=False,
        lazy="selectin",
    )
    """The clip prediction object."""

    sound_event_evaluations: orm.Mapped[list[SoundEventEvaluation]] = (
        orm.relationship(
            back_populates="clip_evaluation",
            cascade="all",
            lazy="joined",
            init=False,
            repr=False,
            default_factory=list,
        )
    )
    """The list of sound event evaluations associated with this clip evaluation."""

    metrics: orm.Mapped[list["ClipEvaluationMetric"]] = orm.relationship(
        back_populates="clip_evaluation",
        cascade="all",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )
    """A list of metrics associated with this clip evaluation."""

    # Backrefs
    evaluation: orm.Mapped["Evaluation"] = orm.relationship(
        back_populates="clip_evaluations",
        init=False,
        repr=False,
    )
    """The overall evaluation object to which this clip evaluation belongs."""


class ClipEvaluationMetric(Base):
    """Clip Evaluation Metric.

    Represents a specific metric used to evaluate a clip-level prediction.

    This class stores the value of a single evaluation metric
    (e.g., accuracy, precision, recall) calculated for a ClipEvaluation.
    It links the metric value to its name (stored in the FeatureName table)
    and the corresponding clip evaluation.
    """

    __tablename__ = "clip_evaluation_metric"
    __table_args__ = (
        UniqueConstraint(
            "clip_evaluation_id",
            "feature_name_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database ID of the metric."""

    clip_evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_evaluation.id"),
        nullable=False,
    )
    """The ID of the clip evaluation to which this metric belongs."""

    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id"),
        nullable=False,
    )
    """The ID of the feature name associated with this metric."""

    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The value of the metric."""

    name: AssociationProxy[str] = association_proxy(
        "feature_name",
        "name",
        init=False,
    )
    """The name of the metric (accessed via the FeatureName relationship)."""

    # Relationships
    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The FeatureName object associated with this metric."""

    # Backrefs
    clip_evaluation: orm.Mapped[ClipEvaluation] = orm.relationship(
        back_populates="metrics",
        init=False,
        repr=False,
    )
    """The clip evaluation to which the metric belongs."""
