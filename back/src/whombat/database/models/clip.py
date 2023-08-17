"""Clip model.

A clip is a contiguous fragment of a recording, defined by its start and end
times. While recordings are the base source of information, clips are the unit
of work in the app. When annotating audio, users are provided with a clip to
annotate, rather than the entire recording. Similarly, machine learning models
are typically run on audio clips instead of whole recordings. There are several
reasons for this. Firstly, working with very long audio files can be
computationally prohibitive both for visualizing and annotating. Secondly,
standardizing the duration of clips makes it easier to perform consistent and
comparable annotations across different recordings. Finally, many machine
learning models process audio files in clips and generate a prediction per
clip, making it logical to adopt this structure in the app. By working with
clips, users can also easily focus on specific parts of the recording, and
identify relevant sound events with greater ease.
"""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.base import Base
from whombat.database.models.feature import FeatureName
from whombat.database.models.recording import Recording
from whombat.database.models.tag import Tag

__all__ = [
    "Clip",
    "ClipTag",
    "ClipFeature",
]


class Clip(Base):
    """Clip model for clip table.

    This model represents the clip table in the database.

    """

    __tablename__ = "clip"

    id: orm.Mapped[int] = orm.mapped_column(
        primary_key=True,
        init=False,
    )
    """The id of the clip."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    """The UUID of the clip."""

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
    )

    start_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The start time of the clip in seconds."""

    end_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The end time of the clip in seconds."""

    recording: orm.Mapped[Recording] = orm.relationship(
        back_populates="clips",
        lazy="joined",
        init=False,
        repr=False,
    )
    """The recording to which the clip belongs."""

    tags: orm.Mapped[list[Tag]] = orm.relationship(
        secondary="clip_tag",
        lazy="joined",
        back_populates="clips",
        default_factory=list,
        viewonly=True,
        repr=False,
    )
    """The tags associated with the clip."""

    clip_tags: orm.Mapped[list["ClipTag"]] = orm.relationship(
        lazy="joined",
        back_populates="clip",
        default_factory=list,
        cascade="all, delete-orphan",
        repr=False,
    )

    features: orm.Mapped[list["ClipFeature"]] = orm.relationship(
        "ClipFeature",
        lazy="joined",
        back_populates="clip",
        default_factory=list,
        cascade="all, delete-orphan",
        repr=False,
    )
    """The features associated with the clip."""

    __table_args__ = (
        UniqueConstraint(
            "recording_id",
            "start_time",
            "end_time",
        ),
    )


class ClipTag(Base):
    """ClipTag model for clip_tag table.

    Tags can be added to clips to indicate the presence of a sound event in the
    clip, or to describe the clip in some way. For example, a tag could be used
    to indicate that a clip contains a bird call, or that it contains a
    particular species of bird.

    """

    __tablename__ = "clip_tag"

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the clip to which the tag belongs."""

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the tag."""

    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        repr=False,
    )
    """The clip to which the tag belongs."""

    tag: orm.Mapped[Tag] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The tag."""

    __table_args__ = (
        UniqueConstraint(
            "clip_id",
            "tag_id",
        ),
    )


class ClipFeature(Base):
    """ClipFeature model for clip_feature table.

    In clips, features are useful for describing the acoustic
    content of the entire soundscape, such as the signal-to-noise
    ratio or acoustic indices.
    """

    __tablename__ = "clip_feature"

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the clip to which the feature belongs."""

    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id"),
        nullable=False,
        primary_key=True,
    )
    """The id of the feature name."""

    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The value of the feature."""

    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
    """The name of the feature."""

    clip: orm.Mapped[Clip] = orm.relationship(
        init=False,
        repr=False,
        cascade="all",
    )
    """The clip to which the feature belongs."""

    __table_args__ = (
        UniqueConstraint(
            "clip_id",
            "feature_name_id",
        ),
    )
