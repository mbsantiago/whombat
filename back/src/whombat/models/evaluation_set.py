"""Evaluation set model."""
import typing
from enum import Enum
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.tag import Tag
from whombat.models.task import Task

if typing.TYPE_CHECKING:
    from whombat.models.evaluation_task import EvaluationTask
    from whombat.models.prediction_run import PredictionRun

__all__ = [
    "EvaluationSet",
    "EvaluationSetTag",
]


class EvaluationMode(str, Enum):
    """Evaluation mode."""

    SOUND_EVENT_CLASSIFICATION = "sound_event_classification"
    """Sound event evaluation mode.

    This mode refers to evaluating the model ability to assign the correct
    tag to a sound event. For example, if a sound event is a dog bark, then
    the model should assign the tag "dog_bark" to the sound event.

    The target classes are selected by the user when creating the evaluation
    set by selecting the tags to focus on. Each tag will be considered
    an individual class, and the model will be evaluated on its ability to
    assign the correct tag to a sound event.

    The examples of the target classes are derived from the sound event
    annotations of the tasks included in the evaluation set. The model
    will be provided with an audio clip around each sound event, of a
    defined duration, and will be asked to assign the correct tag to the
    sound event. The correct class is determined by the tag of the sound
    event.
    """

    SOUND_EVENT_DETECTION = "sound_event_detection"
    """Sound event detection evaluation mode.

    This mode refers to evaluating the model ability to detect sound events
    in a clip. Here detection refers to locate and classify sound events
    within a clip. For example, if a clip contains a dog bark, then the
    model should identify the bounds of the sound event and assign the tag
    "dog_bark" to the sound event.
    """

    CLIP_MULTILABEL_CLASSIFICATION = "clip_multilabel_classification"
    """Clip multilabel evaluation mode.

    This mode refers to evaluating the model ability to assign the correct
    tags to a clip. For example, if a clip contains a dog bark and a car
    horn, then the model should assign the tags "dog_bark" and "car_horn"
    to the clip.

    The target classes are selected by the user when creating the evaluation
    set by selecting the tags to focus on. Each tag will be considered
    an individual class, and the model will be evaluated on its ability to
    assign the correct tags to a clip.

    The true tags of a clip are derived from the clip-level tags of the
    tasks included in the evaluation set.
    """

    CLIP_CLASSIFICATION = "clip_classification"
    """Clip evaluation mode.

    This mode refers to evaluating the model ability to assign the correct
    tag to a clip. For example, if a clip contains a dog bark, then the
    model should assign the tag "dog_bark" to the clip.

    The target classes are selected by the user when creating the evaluation
    set by selecting the tags to focus on. Each tag will be considered
    an individual class, and the model will be evaluated on its ability to
    assign the correct tag to a clip.

    The true tags of a clip are derived from the clip-level tags of the
    tasks included in the evaluation set.
    """


class EvaluationSet(Base):
    """Evaluation Set model."""

    __tablename__ = "evaluation_set"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """Evaluation set ID."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    """Unique evaluation set ID."""

    mode: orm.Mapped[EvaluationMode] = orm.mapped_column(
        nullable=False,
    )
    """Evaluation mode."""

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
        init=False,
        repr=False,
    )
    """Set of annotation tasks to use for evaluation."""

    evaluation_set_tasks: orm.Mapped[
        list["EvaluationTask"]
    ] = orm.relationship(
        "EvaluationTask",
        back_populates="evaluation_set",
        default_factory=list,
        cascade="all, delete-orphan",
        init=False,
        repr=False,
    )

    prediction_runs: orm.Mapped[list["PredictionRun"]] = orm.relationship(
        "PredictionRun",
        back_populates="evaluation_set",
        default_factory=list,
        cascade="all, delete-orphan",
        init=False,
        repr=False,
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
