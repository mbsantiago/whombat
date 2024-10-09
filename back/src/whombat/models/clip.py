"""Clip model.

A clip is a contiguous fragment of a recording, defined by its start and
end times. While recordings are the base source of information, clips
are the unit of work in the app. When annotating audio, users are
provided with a clip to annotate, rather than the entire recording.
Similarly, machine learning models are typically run on audio clips
instead of whole recordings. There are several reasons for this.
Firstly, working with very long audio files can be computationally
prohibitive both for visualizing and annotating. Secondly, standardizing
the duration of clips makes it easier to perform consistent and
comparable annotations across different recordings. Finally, many
machine learning models process audio files in clips and generate a
prediction per clip, making it logical to adopt this structure in the
app. By working with clips, users can also easily focus on specific
parts of the recording, and identify relevant sound events with greater
ease.
"""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy

from whombat.models.base import Base
from whombat.models.feature import FeatureName
from whombat.models.recording import Recording

__all__ = [
    "Clip",
    "ClipFeature",
]


class Clip(Base):
    """Clip Model."""

    __tablename__ = "clip"
    __table_args__ = (
        UniqueConstraint(
            "recording_id",
            "start_time",
            "end_time",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the clip."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4, kw_only=True, unique=True
    )
    """The UUID of the clip."""

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"), nullable=False
    )
    """The database id of the recording to which the clip belongs."""

    start_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The start time of the clip in seconds."""

    end_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The end time of the clip in seconds."""

    # Relations
    recording: orm.Mapped[Recording] = orm.relationship(
        back_populates="clips",
        lazy="joined",
        init=False,
        repr=False,
    )
    """The recording to which the clip belongs."""

    features: orm.Mapped[list["ClipFeature"]] = orm.relationship(
        "ClipFeature",
        lazy="joined",
        back_populates="clip",
        default_factory=list,
        cascade="all, delete-orphan",
        repr=False,
    )
    """The features associated with the clip"""


class ClipFeature(Base):
    """Clip Feature Model."""

    __tablename__ = "clip_feature"
    __table_args__ = (
        UniqueConstraint(
            "clip_id",
            "feature_name_id",
        ),
    )

    clip_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("clip.id"),
        nullable=False,
        primary_key=True,
    )
    """The database id of the clip to which the feature belongs."""

    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id"),
        nullable=False,
        primary_key=True,
    )
    """The database id of the feature name of the feature."""

    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The value of the feature."""

    name: AssociationProxy[str] = association_proxy(
        "feature_name",
        "name",
        init=False,
    )
    """The name of the feature."""

    # Relations
    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )

    # Relations (back-refs)
    clip: orm.Mapped[Clip] = orm.relationship(
        back_populates="features",
        init=False,
        repr=False,
    )
