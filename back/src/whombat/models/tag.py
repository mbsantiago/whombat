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

from typing import TYPE_CHECKING

import sqlalchemy.orm as orm
from sqlalchemy import UniqueConstraint

from whombat.models.base import Base

__all__ = [
    "Tag",
]


class Tag(Base):
    """Tag model for tag table.

    Attributes
    ----------
    id
        The database id of the tag.
    key
        The key of the tag. The key serves as a way to group tags into
        coherent categories, similar to a namespace.
    value
        The value of the tag, the actual content of the tag.

    Parameters
    ----------
    key : str
        The key of the tag.
    value : str
        The value of the tag.
    """

    __tablename__ = "tag"
    __table_args__ = (UniqueConstraint("key", "value"),)

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    key: orm.Mapped[str] = orm.mapped_column(nullable=False)
    value: orm.Mapped[str] = orm.mapped_column(nullable=False)

    # ========================================================================
    # Relationships (backrefs)

    if TYPE_CHECKING:
        from whombat.models.annotation_project import (
            AnnotationProject,
            AnnotationProjectTag,
        )
        from whombat.models.clip import Clip
        from whombat.models.clip_annotation import (
            ClipAnnotation,
            ClipAnnotationTag,
        )
        from whombat.models.clip_prediction import ClipPredictionTag
        from whombat.models.evaluation_set import EvaluationSetTag
        from whombat.models.recording import Recording, RecordingTag
        from whombat.models.sound_event import SoundEvent
        from whombat.models.sound_event_annotation import (
            SoundEventAnnotation,
            SoundEventAnnotationTag,
        )
        from whombat.models.sound_event_prediction import (
            SoundEventPredictionTag,
        )

    recordings: orm.Mapped[list["Recording"]] = orm.relationship(
        back_populates="tags",
        secondary="recording_tag",
        init=False,
        repr=False,
        viewonly=True,
        default_factory=list,
    )
    recording_tags: orm.Mapped[list["RecordingTag"]] = orm.relationship(
        back_populates="tag",
        init=False,
        repr=False,
        default_factory=list,
    )
    sound_event_annotations: orm.Mapped[list["SoundEventAnnotation"]] = (
        orm.relationship(
            back_populates="tags",
            secondary="sound_event_annotation_tag",
            init=False,
            repr=False,
            viewonly=True,
            default_factory=list,
        )
    )
    sound_event_annotation_tags: orm.Mapped[
        list["SoundEventAnnotationTag"]
    ] = orm.relationship(
        back_populates="tag",
        init=False,
        repr=False,
        default_factory=list,
    )
    clip_annotations: orm.Mapped[list["ClipAnnotation"]] = orm.relationship(
        back_populates="tags",
        secondary="clip_annotation_tag",
        init=False,
        repr=False,
        viewonly=True,
        default_factory=list,
    )
    clip_annotation_tags: orm.Mapped[list["ClipAnnotationTag"]] = (
        orm.relationship(
            back_populates="tag",
            init=False,
            repr=False,
            default_factory=list,
        )
    )
    evaluation_set_tags: orm.Mapped[list["EvaluationSetTag"]] = (
        orm.relationship(
            back_populates="tag",
            init=False,
            repr=False,
            default_factory=list,
        )
    )
    annotation_projects: orm.Mapped[list["AnnotationProject"]] = (
        orm.relationship(
            back_populates="tags",
            secondary="annotation_project_tag",
            init=False,
            repr=False,
            viewonly=True,
            default_factory=list,
        )
    )
    annotation_project_tags: orm.Mapped[list["AnnotationProjectTag"]] = (
        orm.relationship(
            back_populates="tag",
            init=False,
            repr=False,
            default_factory=list,
        )
    )
    sound_event_prediction_tags: orm.Mapped[
        list["SoundEventPredictionTag"]
    ] = orm.relationship(
        back_populates="tag",
        init=False,
        repr=False,
        default_factory=list,
    )
    clip_prediction_tags: orm.Mapped[list["ClipPredictionTag"]] = (
        orm.relationship(
            back_populates="tag",
            init=False,
            repr=False,
            default_factory=list,
        )
    )
