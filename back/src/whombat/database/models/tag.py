"""Tag model.

Tags are used throughout the app to attach special meaning to objects. They
provide a flexible way for users to add additional information and metadata to
recordings, clips, and sound events.

Tags can be attached to recordings to provide extra information about the
recording, such as the vegetation type of the surrounding recording site, the
device used to generate the recording, or the name of the protocol used to
record. This information can be used to organize recordings and make it easier
to find and filter specific recordings within a dataset.

Tags can also be attached to recording clips to highlight different aspects of
the acoustic content. For example, they can be used to list all the species
that were found within a clip, to indicate that the clip is noisy, or to
classify the soundscape into a single category.

Finally, tags can also be attached to individual sound events within a
recording. These tags provide a way to describe the sound event in greater
detail and add additional metadata to it. For example, tags can be used to
indicate the species that emitted the sound, providing valuable information for
species identification and analysis. Users can also attach tags to indicate the
behavior the emitter was displaying, such as mating, territorial, or alarm
calls. In addition, tags can be used to indicate whether the sound is a
particular syllable within a larger vocalization, such as syllable A or B. This
allows users to analyze vocalizations at a more granular level and provides
additional information for vocalization classification and analysis.

Each tag is defined by a key-value pair. The key helps group several tags into
coherent categories, making it easier to organize and filter the tags within
the app. There are no restrictions on what can be a key or value, so users are
encouraged to carefully consider which tags they need to use in their projects.

Tags provide a flexible way to add additional information and metadata to audio
recordings and their associated objects within the app. By attaching tags to
these objects, users can more easily organize, filter, and analyze audio data,
making it simpler to extract meaningful insights and information.
"""


import sqlalchemy.orm as orm
from sqlalchemy import UniqueConstraint

from whombat.database.models.base import Base

__all__ = [
    "Tag",
]


class Tag(Base):
    """Tag model for tag table.

    This model represents the tag table in the database.
    """

    __tablename__ = "tag"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    """The id of the tag."""

    key: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The key of the tag."""

    value: orm.Mapped[str] = orm.mapped_column(nullable=False)
    """The value of the tag."""

    __table_args__ = (UniqueConstraint("key", "value"),)
