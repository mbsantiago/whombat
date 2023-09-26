"""Evaluation model.

An Evaluation can be conducted on a Model Run to get information about the
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
from whombat.models.evaluation_set import EvaluationSet
from whombat.models.model_run import ModelRun

__all__ = [
    "Evaluation",
]


class Evaluation(Base):
    """Evaluation model."""

    __tablename__ = "evaluation"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Evaluation ID."""

    model_run_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("model_run.id"),
        nullable=False,
    )
    """Model Run ID."""

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
        nullable=False,
    )
    """Evaluation Set ID."""

    model_run: orm.Mapped[ModelRun] = orm.relationship(
        "ModelRun",
        back_populates="evaluations",
        lazy="joined",
        init=False,
        repr=False,
    )
    """Model Run to which the evaluation belongs."""

    evaluation_set: orm.Mapped[EvaluationSet] = orm.relationship(
        "EvaluationSet",
        back_populates="evaluations",
        lazy="joined",
        init=False,
        repr=False,
    )
    """Evaluation Set to which the evaluation belongs."""

    __table_args__ = (UniqueConstraint("model_run_id", "evaluation_set_id"),)
