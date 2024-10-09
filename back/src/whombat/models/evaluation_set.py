"""Evaluation set model."""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.clip_annotation import ClipAnnotation
from whombat.models.model_run import ModelRun
from whombat.models.tag import Tag
from whombat.models.user_run import UserRun

__all__ = [
    "EvaluationSet",
    "EvaluationSetTag",
    "EvaluationSetAnnotation",
    "EvaluationSetModelRun",
    "EvaluationSetUserRun",
]


class EvaluationSet(Base):
    """Evaluation Set Model.

    Represents a collection of data and settings for evaluating model
    predictions.

    An EvaluationSet defines the parameters and data required for a specific
    evaluation task. It includes:

    1. **Target Tags:** The list of sound tags that are the focus of the
       evaluation.
    2. **Prediction Task:** The type of prediction being evaluated (e.g., sound
       event detection).
    3. **Ground Truth Examples:** A set of clip annotations serving as the
       ground truth for comparison.

    This allows for structured and standardized evaluation of different models
    and prediction types.
    """

    __tablename__ = "evaluation_set"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database ID of the evaluation set."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    """A unique UUID for the evaluation set."""

    name: orm.Mapped[str] = orm.mapped_column(nullable=False, unique=True)
    """A unique name for the evaluation set."""

    description: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """A description of the evaluation set."""

    task: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The type of prediction task being evaluated.

    For example: 'sound_event_detection', 'acoustic_scene_classification', etc.
    """

    # Relationships
    tags: orm.Mapped[list[Tag]] = orm.relationship(
        secondary="evaluation_set_tag",
        lazy="joined",
        viewonly=True,
        default_factory=list,
        repr=False,
    )
    """The list of tags relevant to this evaluation set."""

    clip_annotations: orm.Mapped[list["ClipAnnotation"]] = orm.relationship(
        secondary="evaluation_set_annotation",
        init=False,
        repr=False,
        default_factory=list,
        viewonly=True,
    )
    """The list of clip annotations used as ground truth in this evaluation set."""

    model_runs: orm.Mapped[list[ModelRun]] = orm.relationship(
        secondary="evaluation_set_model_run",
        cascade="all, delete-orphan",
        viewonly=True,
        default_factory=list,
        repr=False,
    )
    """The list of model runs associated with this evaluation set."""

    user_runs: orm.Mapped[list[UserRun]] = orm.relationship(
        secondary="evaluation_set_user_run",
        cascade="all, delete-orphan",
        viewonly=True,
        default_factory=list,
        repr=False,
    )
    """The list of user runs associated with this evaluation set."""

    # Secondary relationships
    evaluation_set_annotations: orm.Mapped[list["EvaluationSetAnnotation"]] = (
        orm.relationship(
            back_populates="evaluation_set",
            default_factory=list,
            cascade="all, delete-orphan",
        )
    )
    evaluation_set_tags: orm.Mapped[list["EvaluationSetTag"]] = (
        orm.relationship(
            lazy="joined",
            default_factory=list,
            cascade="all, delete-orphan",
        )
    )

    evaluation_set_model_runs: orm.Mapped[list["EvaluationSetModelRun"]] = (
        orm.relationship(
            back_populates="evaluation_set",
            default_factory=list,
            cascade="all, delete-orphan",
        )
    )
    evaluation_set_user_runs: orm.Mapped[list["EvaluationSetUserRun"]] = (
        orm.relationship(
            back_populates="evaluation_set",
            default_factory=list,
            cascade="all, delete-orphan",
        )
    )


class EvaluationSetAnnotation(Base):
    """Evaluation Set Annotation Model."""

    __tablename__ = "evaluation_set_annotation"
    __table_args__ = (
        UniqueConstraint(
            "evaluation_set_id",
            "clip_annotation_id",
        ),
    )

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
        nullable=False,
        primary_key=True,
    )
    clip_annotation_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip_annotation.id"),
        nullable=False,
        primary_key=True,
    )

    # Relationships
    evaluation_set: orm.Mapped[EvaluationSet] = orm.relationship(
        back_populates="evaluation_set_annotations",
        init=False,
    )
    clip_annotation: orm.Mapped[ClipAnnotation] = orm.relationship(
        back_populates="evaluation_set_annotations",
        lazy="joined",
        init=False,
    )


class EvaluationSetTag(Base):
    """Evaluation Set Tag model."""

    __tablename__ = "evaluation_set_tag"
    __table_args__ = (UniqueConstraint("evaluation_set_id", "tag_id"),)

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
        nullable=False,
        primary_key=True,
    )
    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
        primary_key=True,
    )

    # Relationships
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


class EvaluationSetModelRun(Base):
    """Evaluation Set Model Run model."""

    __tablename__ = "evaluation_set_model_run"
    __table_args__ = (UniqueConstraint("evaluation_set_id", "model_run_id"),)

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
        nullable=False,
        primary_key=True,
    )
    model_run_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("model_run.id"),
        nullable=False,
        primary_key=True,
    )

    # Relationships
    evaluation_set: orm.Mapped[EvaluationSet] = orm.relationship(
        back_populates="evaluation_set_model_runs",
        init=False,
        repr=False,
    )
    model_run: orm.Mapped[ModelRun] = orm.relationship(
        back_populates="evaluation_set_model_runs",
        init=False,
        repr=False,
    )


class EvaluationSetUserRun(Base):
    """Evaluation Set User Run.

    Represents the association between an EvaluationSet and a UserRun.

    This model acts as a bridge table, connecting EvaluationSets to specific
    UserRuns. It enables tracking and managing which user-generated runs are
    associated with each evaluation set, facilitating analysis and comparison
    of user performance within defined evaluation scenarios.
    """

    __tablename__ = "evaluation_set_user_run"
    __table_args__ = (UniqueConstraint("evaluation_set_id", "user_run_id"),)

    evaluation_set_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("evaluation_set.id"),
        nullable=False,
        primary_key=True,
    )
    """The ID of the associated EvaluationSet."""

    user_run_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("user_run.id"),
        nullable=False,
        primary_key=True,
    )
    """The ID of the associated UserRun."""

    # Relationships
    evaluation_set: orm.Mapped[EvaluationSet] = orm.relationship(
        back_populates="evaluation_set_user_runs",
        init=False,
        repr=False,
    )
    """The EvaluationSet object linked to this association."""

    user_run: orm.Mapped[UserRun] = orm.relationship(
        back_populates="evaluation_set_user_runs",
        init=False,
        repr=False,
    )
    """The UserRun object linked to this association."""
