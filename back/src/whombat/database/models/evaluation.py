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

from whombat.database.models.base import Base
from whombat.database.models.tag import Tag


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

    clip_level: orm.Mapped[bool] = orm.mapped_column(nullable=False)
    """Evaluate at the clip level."""

    sound_event_level: orm.Mapped[bool] = orm.mapped_column(nullable=False)
    """Evaluate at the sound event level."""

    tags: orm.Mapped[list[Tag]] = orm.relationship(
        "Tag",
        secondary="evaluation_tag",
    )


class EvaluationTag(Base):
    """Evaluation Tag model."""

    __tablename__ = "evaluation_tag"

    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        nullable=False,
        primary_key=True,
    )
    """Evaluation ID."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
        primary_key=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "evaluation_id",
            "tag_id",
        ),
    )


