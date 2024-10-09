"""Feature model.

Features are numerical values that can be attached to sound events,
clips, and recordings. They provide additional information to the
objects they are attached to and are useful for searching and organizing
your data. Each feature consists of a name and a value, where the name
describes the feature and the value is its numeric representation.

In sound events, features are useful for providing basic information
about the sound event, such as its duration or bandwidth, or for
providing more detailed information that can be extracted using a deep
learning model. In clips, features are useful for describing the
acoustic content of the entire soundscape, such as the signal-to-noise
ratio or acoustic indices. In recordings, features can provide important
contextual information of a numeric type, such as temperature or wind
speed at the time of recording, or the height of the recorder.

Having multiple features attached to sound events, clips, and recordings
enables users to explore the set of annotations more thoroughly, such as
identifying outliers and understanding the distribution of features
across a collection of sound events.

Some features are automatically computed from the geometry of the sound
event, such as its duration and bandwidth, and are automatically added
to the sound event. Other features can be manually added by the user. We
also hope that more features can be computed automatically in the future
through community plugins.
"""

import typing

import sqlalchemy.orm as orm

from whombat.models.base import Base

__all__ = [
    "FeatureName",
]


class FeatureName(Base):
    """Feature Name Model.

    Represents the name of a feature.

    Features are numerical values associated with sound events, clips,
    or recordings, providing additional information about these objects.
    This model stores the unique names of those features.

    Features can represent various aspects:

    * **Sound Events:** Duration, bandwidth, or other characteristics extracted
        via deep learning models.
    * **Clips:** Acoustic properties like signal-to-noise ratio or acoustic
        indices.
    * **Recordings:** Contextual information like temperature, wind speed, or
        recorder height.
    """

    __tablename__ = "feature_name"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The database id of the feature name"""

    name: orm.Mapped[str] = orm.mapped_column(nullable=False, unique=True)
    """The feature name."""

    # ========================================================================
    # Relationships (backrefs)
    #
    if typing.TYPE_CHECKING:
        from whombat.models.clip import ClipFeature
        from whombat.models.recording import RecordingFeature
        from whombat.models.sound_event import SoundEventFeature

    recordings: orm.Mapped[list["RecordingFeature"]] = orm.relationship(
        "RecordingFeature",
        back_populates="feature_name",
        init=False,
        repr=False,
        default_factory=list,
    )

    clips: orm.Mapped[list["ClipFeature"]] = orm.relationship(
        "ClipFeature",
        back_populates="feature_name",
        init=False,
        repr=False,
        default_factory=list,
    )

    sound_events: orm.Mapped[list["SoundEventFeature"]] = orm.relationship(
        "SoundEventFeature",
        back_populates="feature_name",
        init=False,
        repr=False,
        default_factory=list,
    )
