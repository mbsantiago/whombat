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

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy

from whombat.models.base import Base
from whombat.models.feature import FeatureName
from whombat.models.recording import Recording

if TYPE_CHECKING:
    pass

__all__ = [
    "Clip",
    "ClipFeature",
]


class Clip(Base):
    """Clip Model.

    Attributes
    ----------
    id
        The database id of the clip.
    uuid
        The UUID of the clip.
    start_time
        The start time of the clip in seconds.
    end_time
        The end time of the clip in seconds.
    recording
        The recording to which the clip belongs.
    features
        A list of features associated with the clip.
    created_on
        The date and time the clip was created.

    Parameters
    ----------
    recording_id : int
        The database id of the recording to which the clip belongs.
    start_time : float
        Start time of the clip in seconds, with respect to the start of
        the recording.
    end_time : float
        End time of the clip in seconds, with respect to the start of
        the recording.
    uuid : UUID, optional
        The UUID of the clip.
    """

    __tablename__ = "clip"
    __table_args__ = (
        UniqueConstraint(
            "recording_id",
            "start_time",
            "end_time",
        ),
    )

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4, kw_only=True, unique=True
    )
    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"), nullable=False
    )
    start_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    end_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    score: orm.Mapped[Optional[float]] = orm.mapped_column(default=None)

    # Relations
    recording: orm.Mapped[Recording] = orm.relationship(
        back_populates="clips",
        lazy="joined",
        init=False,
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


class ClipFeature(Base):
    """Clip Feature Model.

    Attributes
    ----------
    value : float
        The value of the feature.
    feature_name : FeatureName
        The name of the feature.

    Parameters
    ----------
    clip_id : int
        The database id of the clip to which the feature belongs.
    feature_name_id : int
        The database id of the feature name.
    value : float
        The value of the feature.
    """

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
    feature_name_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature_name.id"),
        nullable=False,
        primary_key=True,
    )
    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    name: AssociationProxy[str] = association_proxy(
        "feature_name",
        "name",
        init=False,
    )

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
