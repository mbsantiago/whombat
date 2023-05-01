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
from sqlalchemy import ForeignKey

from whombat.database.models.base import Base
from whombat.database.models.recording import Recording


class Clip(Base):
    """Clip model for clip table.

    This model represents the clip table in the database.

    """

    __tablename__ = "clip"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True)
    """The id of the clip."""

    uuid: orm.Mapped[UUID] = orm.mapped_column(default=uuid4)
    """The UUID of the clip."""

    recording_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("recording.id"),
        nullable=False,
    )

    recording: orm.Mapped[Recording] = orm.relationship()

    start_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The start time of the clip in seconds."""

    end_time: orm.Mapped[float] = orm.mapped_column(nullable=False)
    """The end time of the clip in seconds."""
