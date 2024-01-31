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

    Attributes
    ----------
    id
        The database id of the clip evaluation.
    uuid
        The UUID of the clip evaluation.
    clip_annotation
        The clip annotations to use as ground truth
        for the evaluation.
    clip_prediction
        The clip prediction to be evaluated.
    score
        The overall score of the evaluation.
    metrics
        A list of metrics associated with the evaluation.
    sound_event_evaluations
        A list of sound event evaluations associated with the clip evaluation.
    created_on
        The date and time the clip evaluation was created.

    Parameters
    ----------
    clip_annotation_id : int
        The database id of the clip annotation to use as ground truth.
    clip_prediction_id : int
        The database id of the clip prediction to be evaluated.
    evaluation_id : int
        The database id of the evaluation to which the clip evaluation belongs.
    score : float
        The overall score of the evaluation.
    uuid : UUID, optional
        The UUID of the clip evaluation.
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
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        unique=True,
        kw_only=True,
    )
    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        nullable=False,
    )
    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id"),
        nullable=False,
    )
    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
        nullable=False,
    )
    score: orm.Mapped[float] = orm.mapped_column(nullable=False)

    # Relationships
    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        init=False,
        lazy="selectin",
    )
    clip_prediction: orm.Mapped[ClipPrediction] = orm.relationship(
        init=False,
        lazy="selectin",
    )
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
    metrics: orm.Mapped[list["ClipEvaluationMetric"]] = orm.relationship(
        back_populates="clip_evaluation",
        cascade="all",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )

    # Backrefs
    evaluation: orm.Mapped["Evaluation"] = orm.relationship(
        back_populates="clip_evaluations",
        init=False,
        repr=False,
    )


class ClipEvaluationMetric(Base):
    """Clip Evaluation Metric Model.

    Attributes
    ----------
    id : int
        The database id of the metric.
    value : float
        The value of the metric.
    feature_name: FeatureName
        The name of the metric.
    created_on : datetime
        The date and time the metric was created.

    Parameters
    ----------
    clip_evaluation_id : int
        The database id of the clip evaluation to which the metric belongs.
    feature_name_id : int
        The database id of the feature name.
    value : float
        The value of the metric.

    Notes
    -----
    We are reusing the FeatureName model for the metric name.
    """

    __tablename__ = "clip_evaluation_metric"
    __table_args__ = (
        UniqueConstraint(
            "clip_evaluation_id",
            "feature_name_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    clip_evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_evaluation.id"),
        nullable=False,
    )
    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id"),
        nullable=False,
    )
    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    name: AssociationProxy[str] = association_proxy(
        "feature_name",
        "name",
        init=False,
    )

    # Relationships
    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )

    # Backrefs
    clip_evaluation: orm.Mapped[ClipEvaluation] = orm.relationship(
        back_populates="metrics",
        init=False,
        repr=False,
    )
