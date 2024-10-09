"""User Run User."""

from typing import TYPE_CHECKING
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.clip_prediction import ClipPrediction
from whombat.models.evaluation import Evaluation
from whombat.models.user import User

if TYPE_CHECKING:
    from whombat.models.evaluation_set import (
        EvaluationSet,
        EvaluationSetUserRun,
    )

__all__ = [
    "UserRun",
    "UserRunPrediction",
    "UserRunEvaluation",
]


class UserRun(Base):
    """User Run User."""

    __tablename__ = "user_run"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the user run."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        nullable=False,
        unique=True,
        default_factory=uuid4,
        kw_only=True,
    )
    """The UUID of the user run."""

    user_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user.id"),
        nullable=False,
    )
    """The database id of the user who created the user run."""

    # Relations
    user: orm.Mapped["User"] = orm.relationship(
        back_populates="user_runs",
        init=False,
        repr=False,
        lazy="joined",
    )
    """The user who created the user run."""

    clip_predictions: orm.Mapped[list[ClipPrediction]] = orm.relationship(
        secondary="user_run_prediction",
        init=False,
        repr=False,
        viewonly=True,
        cascade="all, delete-orphan",
    )
    """The list of clip predictions made by the user."""

    evaluations: orm.Mapped[list[Evaluation]] = orm.relationship(
        secondary="user_run_evaluation",
        init=False,
        repr=False,
        viewonly=True,
        cascade="all, delete-orphan",
    )
    """List of evaluations for the user run."""

    # Secondary relations
    user_run_predictions: orm.Mapped[list["UserRunPrediction"]] = (
        orm.relationship(
            init=False,
            repr=False,
            cascade="all, delete-orphan",
        )
    )
    user_run_evaluations: orm.Mapped[list["UserRunEvaluation"]] = (
        orm.relationship(
            init=False,
            repr=False,
            cascade="all, delete-orphan",
        )
    )

    # Backrefs
    evaluation_sets: orm.Mapped[list["EvaluationSet"]] = orm.relationship(
        secondary="evaluation_set_user_run",
        back_populates="user_runs",
        init=False,
        repr=False,
        default_factory=list,
        viewonly=True,
    )
    evaluation_set_user_runs: orm.Mapped[list["EvaluationSetUserRun"]] = (
        orm.relationship(
            back_populates="user_run",
            init=False,
            repr=False,
            default_factory=list,
        )
    )


class UserRunPrediction(Base):
    """User Run Predictions User."""

    __tablename__ = "user_run_prediction"
    __table_args__ = (UniqueConstraint("user_run_id", "clip_prediction_id"),)

    user_run_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user_run.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the user run associated with the prediction."""

    clip_prediction_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_prediction.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the clip prediction associated with the user run."""


class UserRunEvaluation(Base):
    """User Run Evaluation Model."""

    __tablename__ = "user_run_evaluation"
    __table_args__ = (UniqueConstraint("user_run_id", "evaluation_set_id"),)

    user_run_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user_run.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the user run associated with the user run evaluation."""

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the evaluation set associated with the user run evaluation."""

    evaluation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the evaluation associated with the user run evaluation."""
