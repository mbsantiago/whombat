"""Evaluation Task Model.

An evaluation task is a task derived from an annotation project that is used
within an evaluation set. Commonly, the task should be completed by a human
annotator so that any predictions can be confidently compared to the ground
truth annotations derived from the annotation project.
"""

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.evaluation_set import EvaluationSet
from whombat.models.task import Task

__all__ = [
    "EvaluationTask",
]


class EvaluationTask(Base):
    """Evaluation task model."""

    __tablename__ = "evaluation_task"

    id: orm.Mapped[int] = orm.mapped_column(
        primary_key=True,
        init=False,
    )
    """Database ID of the evaluation task."""

    task_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("task.id"),
    )
    """The id of the task."""

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
    )
    """The id of the evaluation set."""

    evaluation_set: orm.Mapped[EvaluationSet] = orm.relationship(
        "EvaluationSet",
        back_populates="evaluation_set_tasks",
        init=False,
    )
    """The evaluation set."""

    task: orm.Mapped[Task] = orm.relationship(
        "Task",
        back_populates="evaluation_tasks",
        init=False,
    )
    """The task."""

    __table_args__ = (UniqueConstraint("task_id", "evaluation_set_id"),)
