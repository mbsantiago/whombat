"""Evaluation set model."""
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.base import Base
from whombat.models.clip_annotation import ClipAnnotation
from whombat.models.tag import Tag

__all__ = [
    "EvaluationSet",
    "EvaluationSetTag",
    "EvaluationSetAnnotation",
]


# class EvaluationMode(str, Enum):
#     """Evaluation mode."""
#
#     SOUND_EVENT_CLASSIFICATION = "sound_event_classification"
#     """Sound event evaluation mode.
#
#     This mode refers to evaluating the model ability to assign the
#     correct tag to a sound event. For example, if a sound event is a dog
#     bark, then the model should assign the tag "dog_bark" to the sound
#     event.
#
#     The target classes are selected by the user when creating the
#     evaluation set by selecting the tags to focus on. Each tag will be
#     considered an individual class, and the model will be evaluated on
#     its ability to assign the correct tag to a sound event.
#
#     The examples of the target classes are derived from the sound event
#     annotations of the tasks included in the evaluation set. The model
#     will be provided with an audio clip around each sound event, of a
#     defined duration, and will be asked to assign the correct tag to the
#     sound event. The correct class is determined by the tag of the sound
#     event.
#     """
#
#     SOUND_EVENT_DETECTION = "sound_event_detection"
#     """Sound event detection evaluation mode.
#
#     This mode refers to evaluating the model ability to detect sound
#     events in a clip. Here detection refers to locate and classify sound
#     events within a clip. For example, if a clip contains a dog bark,
#     then the model should identify the bounds of the sound event and
#     assign the tag "dog_bark" to the sound event.
#     """
#
#     CLIP_MULTILABEL_CLASSIFICATION = "clip_multilabel_classification"
#     """Clip multilabel evaluation mode.
#
#     This mode refers to evaluating the model ability to assign the
#     correct tags to a clip. For example, if a clip contains a dog bark
#     and a car horn, then the model should assign the tags "dog_bark" and
#     "car_horn" to the clip.
#
#     The target classes are selected by the user when creating the
#     evaluation set by selecting the tags to focus on. Each tag will be
#     considered an individual class, and the model will be evaluated on
#     its ability to assign the correct tags to a clip.
#
#     The true tags of a clip are derived from the clip-level tags of the
#     tasks included in the evaluation set.
#     """
#
#     CLIP_CLASSIFICATION = "clip_classification"
#     """Clip evaluation mode.
#
#     This mode refers to evaluating the model ability to assign the
#     correct tag to a clip. For example, if a clip contains a dog bark,
#     then the model should assign the tag "dog_bark" to the clip.
#
#     The target classes are selected by the user when creating the
#     evaluation set by selecting the tags to focus on. Each tag will be
#     considered an individual class, and the model will be evaluated on
#     its ability to assign the correct tag to a clip.
#
#     The true tags of a clip are derived from the clip-level tags of the
#     tasks included in the evaluation set.
#     """


class EvaluationSet(Base):
    """Evaluation Set Model.

    Attributes
    ----------
    id
        The database id of the evaluation set.
    uuid
        The UUID of the evaluation set.
    task
        The task to evaluate. For example, sound event detection.
    name
        The name of the evaluation set.
    description
        A textual description of the evaluation set.
    tags
        The tags to focus on for this evaluation set.
    clip_annotations
        The clip annotations to use as ground truth for the evaluation.
    created_on
        The date and time the evaluation set was created.

    Parameters
    ----------
    task : str
        The task to evaluate. For example, sound event detection.
    name : str
        The name of the evaluation set.
    description : str
        A textual description of the evaluation set. Include information
        about the goal of the evaluation set.
    uuid : UUID, optional
        The UUID of the evaluation set.

    Notes
    -----
    The task can be any string, but it is recommended to use the a common name
    for the task, such as "sound_event_detection",
    "sound_event_classification". There should be a clear and unique relation
    between the task and the way the evaluation is computed.
    """

    __tablename__ = "evaluation_set"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    task: orm.Mapped[str] = orm.mapped_column(
        nullable=False,
    )
    name: orm.Mapped[str] = orm.mapped_column(nullable=False, unique=True)
    description: orm.Mapped[str] = orm.mapped_column(nullable=False)

    # Relationships
    tags: orm.Mapped[list[Tag]] = orm.relationship(
        secondary="evaluation_set_tag",
        lazy="joined",
        viewonly=True,
        default_factory=list,
        repr=False,
    )
    clip_annotations: orm.Mapped[list["ClipAnnotation"]] = orm.relationship(
        secondary="evaluation_set_annotation",
        init=False,
        repr=False,
        default_factory=list,
        viewonly=True,
    )

    # Secondary relationships
    evaluation_set_annotations: orm.Mapped[
        list["EvaluationSetAnnotation"]
    ] = orm.relationship(
        back_populates="evaluation_set",
        default_factory=list,
        cascade="all, delete-orphan",
    )
    evaluation_set_tags: orm.Mapped[
        list["EvaluationSetTag"]
    ] = orm.relationship(
        lazy="joined",
        default_factory=list,
        cascade="all, delete-orphan",
    )
    """Set of tags to focus on for this evaluation set."""


class EvaluationSetAnnotation(Base):
    """Evaluation Set Annotation Model.

    Attributes
    ----------
    clip_annotation
        The clip annotation to use as ground truth for the evaluation.
    created_on
        The date and time the evaluation set clip annotation was created.

    Parameters
    ----------
    evaluation_set_id : int
        The database id of the evaluation set.
    clip_annotation_id : int
        The database id of the clip annotation.
    """

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
    """Evaluation Set Tag model.

    Attributes
    ----------
    tag
        The tag to focus on for this evaluation set.
    created_on
        The date and time the evaluation set tag was created.

    Parameters
    ----------
    evaluation_set_id : int
        The database id of the evaluation set.
    tag_id : int
        The database id of the tag.
    """

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
