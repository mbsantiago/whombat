"""Sound Event model.

Sound events are the heart of the app, as they are the primary objects of
annotation. A sound event is any distinguishable sound within a recording that
is of interest to users. The app allows users to efficiently find and annotate
relevant sound events, which can then be used to generate machine learning
models for automatic detection.

A recording can have multiple sound events, or none at all. To annotate a sound
event, the user marks the region within the spectrogram to which it is
confined. There are several ways to mark the region, such as by indicating the
timestamp for the onset of the sound event, indicating when the sound event
starts and stops, or providing very detailed information about which time and
frequency regions belong to the sound event.

Each annotation has a type, depending on the geometry type of the mark, such as
point, line, or rectangle. The geometry of the mark itself is also recorded,
allowing for detailed information about the sound event to be stored. For
example, if the annotation is a rectangle, information about the frequency
range and duration of the sound event can be recorded.

The app also allows for the addition of tags to sound events, providing
additional information about the sound event. Tags can include information such
as the species that emitted the sound, the behavior the emitter was displaying,
or the syllable type of the sound. By annotating a sufficiently large and
diverse set of sound events, the app can help users efficiently generate
machine learning models that can detect these events automatically.
"""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.database.models.base import Base
from whombat.database.models.recording import Recording, Tag

__all__ = [
    "SoundEvent",
    "SoundEventTag",
    "SoundEventFeature",
]


class SoundEvent(Base):
    """Sound Event model for sound_event table.

    This model represents the sound_event table in the database.
    """

    __tablename__ = "sound_event"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The id of the sound event."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(default=uuid4)
    """The uuid of the sound event."""

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
    )
    """The id of the recording to which the sound event belongs."""

    recording: orm.Mapped[Recording] = orm.relationship()

    geometry_type: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The type of geometry used to mark the sound event."""

    geometry: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The geometry of the mark used to mark the sound event.

    The geometry is a JSON string that contains the coordinates of the mark.
    """


class SoundEventTag(Base):
    """SoundEventTag model for sound_event_tag table.

    Tags can be added to sound event to provide additional information about the
    sound event. For example, a tag could be used to indicate that a sound event
    is a bird call of a particular species.

    """

    __tablename__ = "sound_event_tag"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The id of the sound event tag."""

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """The id of the sound event to which the tag belongs."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship()

    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
    )
    """The id of the tag."""

    tag: orm.Mapped[Tag] = orm.relationship()
    """The tag."""

    __table_args__ = (
        UniqueConstraint(
            "sound_event_id",
            "tag_id",
        ),
    )


class SoundEventFeature(Base):
    """Sound Event Feature model.

    In sound events, features are useful for providing basic information about the
    sound event, such as its duration or bandwidth, or for providing more detailed
    information that can be extracted using a deep learning model.
    """

    __tablename__ = "sound_event_feature"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
        nullable=False,
    )
    """The id of the sound event to which the feature belongs."""

    sound_event: orm.Mapped[SoundEvent] = orm.relationship()
    """The sound event."""

    feature_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("feature.id"),
        nullable=False,
    )
    """The id of the feature."""

    feature: orm.Mapped[Tag] = orm.relationship()
    """The feature."""

    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The value of the feature."""

    __table_args__ = (
        UniqueConstraint(
            "sound_event_id",
            "feature_id",
        ),
    )
