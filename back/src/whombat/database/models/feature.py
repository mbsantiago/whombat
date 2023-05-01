"""Feature model.

Features are numerical values that can be attached to sound events, clips, and
recordings. They provide additional information to the objects they are
attached to and are useful for searching and organizing your data. Each feature
consists of a key and a value, where the key describes the feature and the
value is its numeric representation.

In sound events, features are useful for providing basic information about the
sound event, such as its duration or bandwidth, or for providing more detailed
information that can be extracted using a deep learning model. In clips,
features are useful for describing the acoustic content of the entire
soundscape, such as the signal-to-noise ratio or acoustic indices. In
recordings, features can provide important contextual information of a numeric
type, such as temperature or wind speed at the time of recording, or the height
of the recorder.

Having multiple features attached to sound events, clips, and recordings
enables users to explore the set of annotations more thoroughly, such as
identifying outliers and understanding the distribution of features across a
collection of sound events.

Some features are automatically computed from the geometry of the sound event,
such as its duration and bandwidth, and are automatically added to the
sound event. Other features can be manually added by the user. We also
hope that more features can be computed automatically in the future
through community plugins.

"""

import sqlalchemy.orm as orm

from whombat.database.models.base import Base


class Feature(Base):
    """Feature model."""

    __tablename__ = "feature"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """Unique identifier of the feature."""

    key: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """Key of the feature."""

    value: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """Value of the feature."""
