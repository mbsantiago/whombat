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
    """Evaluation model.

    Attributes
    ----------
    id
        The database id of the evaluation.
    uuid
        The UUID of the evaluation.
    score
        The overall score of the evaluation.
    metrics
        A list of metrics associated with the evaluation.
    clip_evaluations
        A list of clip evaluations associated with the evaluation.
    created_on
        The date and time the evaluation was created.
    task
        The evaluated task.

    Parameters
    ----------
    score : float
        The overall score of the evaluation.
    uuid : UUID, optional
        The UUID of the evaluation.
    """

    __tablename__ = "evaluation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        nullable=False,
        kw_only=True,
        unique=True,
        default_factory=uuid4,
    )
    task: orm.Mapped[str] = orm.mapped_column(nullable=False)
    score: orm.Mapped[float] = orm.mapped_column(nullable=False, default=0)

    # Relationships
    metrics: orm.Mapped[list["EvaluationMetric"]] = orm.relationship(
        "EvaluationMetric",
        back_populates="evaluation",
        lazy="joined",
        init=False,
        repr=False,
    )
    clip_evaluations: orm.Mapped[list[ClipEvaluation]] = orm.relationship(
        back_populates="evaluation",
        default_factory=list,
        cascade="all, delete-orphan",
        init=False,
        repr=False,
    )


class EvaluationMetric(Base):
    """Evaluation metric model.

    Attributes
    ----------
    id
        The database id of the metric.
    feature_name
        The feature name of the metric.
    value
        The value of the metric.
    created_on
        The date and time the metric was created.

    Parameters
    ----------
    evaluation_id : int
        The database id of the evaluation.
    feature_name_id : int
        The database id of the feature name.
    value : float
        The value of the metric.
    """

    __tablename__ = "evaluation_metric"
    __table_args__ = (
        UniqueConstraint(
            "evaluation_id",
            "feature_name_id",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
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
    evaluation: orm.Mapped[Evaluation] = orm.relationship(
        back_populates="metrics",
        init=False,
        repr=False,
    )
