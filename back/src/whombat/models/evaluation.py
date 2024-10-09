"""Evaluation model.

An Evaluation can be conducted on a Prediction Run to get information
about the performance of the ML model. Evaluation is only possible on
processed clips that have also been completely annotated. If there are
any fully annotated clips that have also been processed by the model, we
can ground truth the model predictions against the user annotations.
Users can restrict the tags that will be evaluated, and also select
whether evaluation will be done at the clip level, at the sound event
level, or both.

Evaluation at the clip level means evaluating the predicted clip tags
against the true tags of the clip provided by the annotators. Each
processed clip's predicted tags will be compared against the annotated
clip tags, and a score will be provided depending on the amount of
correct tags predicted.

At the sound event level, each predicted sound event will be matched
with annotated sound events using an affinity metric, and their
predicted tags will be checked against the true sound event tags. Users
can configure some evaluation parameters, such as how to match sound
events.
"""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy

from whombat.models.base import Base
from whombat.models.clip_evaluation import ClipEvaluation
from whombat.models.feature import FeatureName

__all__ = [
    "Evaluation",
    "EvaluationMetric",
]


class Evaluation(Base):
    """Evaluation.

    Represents a complete evaluation of a model's predictions.

    This class stores high-level information about the evaluation of a
    set of predictions compared to ground truth annotations. It includes
    an overall score, aggregated metrics, and a breakdown of individual
    clip evaluations. This provides a comprehensive overview of the model's
    performance on a specific task (e.g., sound event detection).
    """

    __tablename__ = "evaluation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the evaluation."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        nullable=False,
        kw_only=True,
        unique=True,
        default_factory=uuid4,
    )
    """A unique UUID for the evaluation."""

    task: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The specific task that was evaluated (e.g., 'sound_event_detection')."""

    score: orm.Mapped[float] = orm.mapped_column(nullable=False, default=0)
    """The overall score of the evaluation."""

    # Relationships
    metrics: orm.Mapped[list["EvaluationMetric"]] = orm.relationship(
        "EvaluationMetric",
        back_populates="evaluation",
        lazy="joined",
        init=False,
        repr=False,
    )
    """A list of metrics associated with the overall evaluation."""

    clip_evaluations: orm.Mapped[list[ClipEvaluation]] = orm.relationship(
        back_populates="evaluation",
        default_factory=list,
        cascade="all, delete-orphan",
        init=False,
        repr=False,
    )
    """The list of clip evaluations that make up this overall evaluation."""


class EvaluationMetric(Base):
    """Evaluation Metric.

    Represents a specific metric associated with an overall evaluation.

    This class stores the value of an evaluation metric
    (e.g., overall accuracy, macro F1-score) calculated for an Evaluation.
    It links the metric value to its name (from the FeatureName table) and
    the corresponding evaluation, providing insights into the model's
    performance on a broader level.
    """

    __tablename__ = "evaluation_metric"
    __table_args__ = (
        UniqueConstraint(
            "evaluation_id",
            "feature_name_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database ID of the metric."""

    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        nullable=False,
    )
    """The ID of the evaluation to which this metric belongs."""

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

    evaluation: orm.Mapped[Evaluation] = orm.relationship(
        back_populates="metrics",
        init=False,
        repr=False,
    )
    """The Evaluation object to which this metric belongs."""
