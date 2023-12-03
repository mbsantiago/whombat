"""Model Run Model."""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey

from whombat.models.base import Base

__all__ = [
    "ModelRun",
]


class ModelRun(Base):
    """Model Run Model."""

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        nullable=False,
        unique=True,
        default=uuid4,
        kw_only=True,
    )
    name: orm.Mapped[str] = orm.mapped_column(nullable=False)
    version: orm.Mapped[str] = orm.mapped_column(nullable=False)
    description: orm.Mapped[str] = orm.mapped_column(nullable=False)
    prediction_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("prediction_set.id"),
        nullable=False,
    )


class ModelRunEvaluation(Base):
    """Model Run Evaluation Model."""

    model_run_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("model_run.id"),
        nullable=False,
        foreign_key=True,
    )
    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        nullable=False,
        foreign_key=True,
    )
