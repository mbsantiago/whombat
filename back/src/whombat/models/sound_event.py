"""Sound Event model.

Sound events are the heart of the app, as they are the primary objects
of annotation. A sound event is any distinguishable sound within a
recording that is of interest to users. The app allows users to
efficiently find and annotate relevant sound events, which can then be
used to generate machine learning models for automatic detection.

A recording can have multiple sound events, or none at all. To annotate
a sound event, the user marks the region within the spectrogram to which
it is confined. There are several ways to mark the region, such as by
indicating the timestamp for the onset of the sound event, indicating
when the sound event starts and stops, or providing very detailed
information about which time and frequency regions belong to the sound
event.

Each annotation has a type, depending on the geometry type of the mark,
such as point, line, or rectangle. The geometry of the mark itself is
also recorded, allowing for detailed information about the sound event
to be stored. For example, if the annotation is a rectangle, information
about the frequency range and duration of the sound event can be
recorded.

The app also allows for the addition of tags to sound events, providing
additional information about the sound event. Tags can include
information such as the species that emitted the sound, the behavior the
emitter was displaying, or the syllable type of the sound. By annotating
a sufficiently large and diverse set of sound events, the app can help
users efficiently generate machine learning models that can detect these
events automatically.
"""

from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from soundevent import Geometry
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy

from whombat.models.base import Base
from whombat.models.feature import FeatureName
from whombat.models.recording import Recording

if TYPE_CHECKING:
    from whombat.models.sound_event_annotation import SoundEventAnnotation
    from whombat.models.sound_event_prediction import SoundEventPrediction

__all__ = [
    "SoundEvent",
    "SoundEventFeature",
]


class SoundEvent(Base):
    """Sound Event model.

    Attributes
    ----------
    id
        The database id of the sound event.
    uuid
        The UUID of the sound event.
    geometry_type
        The type of geometry used to mark the RoI of the sound event.
    geometry
        The geometry of the mark used to mark the RoI of the sound event.
    features
        A list of features associated with the sound event.

    Parameters
    ----------
    recording_id : int
        The id of the recording to which the sound event belongs.
    geometry : Geometry
        The geometry of the mark used to mark the RoI of the sound event.
    uuid : UUID, optional
        The UUID of the sound event. If not provided, a new UUID will be
        generated.

    Notes
    -----
    The geometry attribute is stored as a JSON string in the database.
    """

    __tablename__ = "sound_event"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
    )
    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
    )
    geometry_type: orm.Mapped[str] = orm.mapped_column(nullable=False)
    geometry: orm.Mapped[Geometry] = orm.mapped_column(nullable=False)

    # Relations
    recording: orm.Mapped[Recording] = orm.relationship(
        init=False,
        repr=False,
    )
    features: orm.Mapped[list["SoundEventFeature"]] = orm.relationship(
        "SoundEventFeature",
        back_populates="sound_event",
        cascade="all, delete-orphan",
        lazy="joined",
        init=False,
        repr=False,
        default_factory=list,
    )

    # Backrefs
    sound_event_annotation: orm.Mapped[Optional["SoundEventAnnotation"]] = (
        orm.relationship(
            back_populates="sound_event",
            init=False,
            repr=False,
        )
    )
    sound_event_prediction: orm.Mapped[Optional["SoundEventPrediction"]] = (
        orm.relationship(
            back_populates="sound_event",
            init=False,
            repr=False,
        )
    )


class SoundEventFeature(Base):
    """Sound Event Feature model.

    Attributes
    ----------
    feature_name
        The name of the feature.
    value
        The value of the feature.

    Parameters
    ----------
    sound_event_id : int
        The id of the sound event to which the feature belongs.
    feature_name_id : int
        The id of the name of the feature.
    value : float
        The value of the feature.
    """

    __tablename__ = "sound_event_feature"
    __table_args__ = (
        UniqueConstraint(
            "sound_event_id",
            "feature_name_id",
        ),
    )

    sound_event_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("sound_event.id"),
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
    sound_event: orm.Mapped[SoundEvent] = orm.relationship(
        back_populates="features",
        cascade="all",
        init=False,
        repr=False,
    )
    feature_name: orm.Mapped[FeatureName] = orm.relationship(
        init=False,
        repr=False,
        lazy="joined",
    )
