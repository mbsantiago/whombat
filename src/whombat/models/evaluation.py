"""Evaluation model.

An Evaluation can be conducted on a Prediction Run to get information about the
performance of the ML model. Evaluation is only possible on processed clips
that have also been completely annotated. If there are any fully annotated
clips that have also been processed by the model, we can ground truth the
model predictions against the user annotations. Users can restrict the tags
that will be evaluated, and also select whether evaluation will be done at
the clip level, at the sound event level, or both.

Evaluation at the clip level means evaluating the predicted clip tags
against the true tags of the clip provided by the annotators. Each processed
clip's predicted tags will be compared against the annotated clip tags, and
a score will be provided depending on the amount of correct tags predicted.

At the sound event level, each predicted sound event will be matched with
annotated sound events using an affinity metric, and their predicted tags
will be checked against the true sound event tags. Users can configure some
evaluation parameters, such as how to match sound events.

"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.prediction_run import PredictionRun

__all__ = [
    "Evaluation",
]


class Evaluation(Base):
    """Evaluation model."""

    __tablename__ = "evaluation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Evaluation ID."""

    prediction_run_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("prediction_run.id"),
        nullable=False,
    )
    """Model Run ID."""

    prediction_run: orm.Mapped[PredictionRun] = orm.relationship(
        "PredictionRun",
        back_populates="evaluation",
        init=False,
        repr=False,
    )
    """Prediction Run to which the evaluation belongs."""

    score: orm.Mapped[float] = orm.mapped_column(nullable=True, default=0)
    """Overall score of the evaluation."""

    metrics: orm.Mapped[list["EvaluationMetric"]] = orm.relationship(
        "EvaluationMetric",
        back_populates="evaluation",
        lazy="joined",
        init=False,
        repr=False,
    )


class EvaluationMetric(Base):
    """Evaluation metric model."""

    __tablename__ = "evaluation_metric"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Evaluation metric ID."""

    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        nullable=False,
    )
    """Evaluation ID."""

    name: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """Name of the metric."""

    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """Value of the metric."""

    evaluation: orm.Mapped[Evaluation] = orm.relationship(
        "Evaluation",
        back_populates="metrics",
        init=False,
        repr=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "evaluation_id",
            "name",
        ),
    )
