"""Evaluation Clip model.

An Evaluated Clip is a clip that has been processed by the model in a model run
and has also been completely annotated by users. It is used to calculate the
performance of the machine learning model by comparing the predicted tags or
predicted sound events against the true tags or true sound events provided by
the users. The evaluation can be done at both the clip level and sound event
level, depending on the configuration set by the user. The evaluation is only
possible on clips that have been fully annotated by users.

"""

from sqlalchemy import ForeignKey, UniqueConstraint
import sqlalchemy.orm as orm

from whombat.database.models.base import Base


class EvaluatedClip(Base):
    """Evaluated Clip model."""

    __tablename__ = "evaluated_clip"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Evaluated clip ID."""

    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        primary_key=True,
        nullable=False,
    )
    """Model Run ID."""

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        primary_key=True,
        nullable=False,
    )
    """Clip ID."""

    __table_args__ = (
        UniqueConstraint(
            "evaluation_id",
            "clip_id",
        ),
    )
