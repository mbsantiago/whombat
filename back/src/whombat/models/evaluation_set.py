"""Evaluation set model."""
import typing
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.tag import Tag
from whombat.models.task import Task

if typing.TYPE_CHECKING:
    from whombat.models.evaluation_task import EvaluationTask

__all__ = [
    "EvaluationSet",
    "EvaluationSetTag",
]


class EvaluationSet(Base):
    """Evaluation Set model."""

    __tablename__ = "evaluation_set"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Evaluation set ID."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    """Unique evaluation set ID."""

    name: orm.Mapped[str] = orm.mapped_column(nullable=False, unique=True)
    """Name of the evaluation set."""

    description: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """Description of the evaluation set."""

    tags: orm.Mapped[list[Tag]] = orm.relationship(
        "Tag",
        secondary="evaluation_set_tag",
        lazy="joined",
        viewonly=True,
        default_factory=list,
        repr=False,
    )
    """Set of tags to focus on for this evaluation set."""

    evaluation_set_tags: orm.Mapped[
        list["EvaluationSetTag"]
    ] = orm.relationship(
        "EvaluationSetTag",
        lazy="joined",
        default_factory=list,
        cascade="all, delete-orphan",
    )

    tasks: orm.Mapped[Task] = orm.relationship(
        Task,
        secondary="evaluation_task",
        viewonly=True,
        default_factory=list,
        repr=False,
    )
    """Set of annotation tasks to use for evaluation."""

    evaluation_set_tasks: orm.Mapped[list["EvaluationTask"]] = orm.relationship(
        "EvaluationTask",
        back_populates="evaluation_set",
        default_factory=list,
        cascade="all, delete-orphan",
    )


class EvaluationSetTag(Base):
    """Evaluation Set Tag model."""

    __tablename__ = "evaluation_set_tag"

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
        nullable=False,
        primary_key=True,
    )
    """Training set ID."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
        primary_key=True,
    )
    """Tag ID."""

    evaluation_set: orm.Mapped[EvaluationSet] = orm.relationship(
        "EvaluationSet",
        back_populates="evaluation_set_tags",
        init=False,
    )

    tag: orm.Mapped[Tag] = orm.relationship(
        "Tag",
        back_populates="evaluation_set_tags",
        lazy="joined",
        init=False,
    )

    __table_args__ = (UniqueConstraint("evaluation_set_id", "tag_id"),)
