"""Annotation Project model.

An annotation project is a focused effort to label specific sound events
or audio features in a set of recordings. These projects have clear
goals, such as identifying all sound events of a certain species or
tagging all 3-second audio clips with the correct labels. Each project
has a unique name and includes detailed instructions on how to perform
the annotations. The project is divided into individual tasks, each
consisting of a single clip from the registered recordings. Annotators
are assigned to each task to complete the annotations according to the
project criteria, ensuring that all relevant sound events or audio
features are accurately identified and labeled.

When building an annotation project, users can specify the set of tags
they wish to use within the project, and add any number of clips from
the registered recordings. The annotation process then proceeds by
distributing tasks to annotators. Once the user is satisfied that the
annotation criteria have been met, they should indicate that the task
has been completed. Other users can review the completed tasks and add
notes or raise issues with the existing annotations.

It's worth noting that some annotation projects are created with the
purpose of automatically generating machine learning models from the
annotations. Therefore, maintaining a high level of quality control is
essential, including outlier detection.
"""

from uuid import UUID, uuid4

import sqlalchemy.orm as orm
from sqlalchemy import ForeignKey, UniqueConstraint

from whombat.models.annotation_task import AnnotationTask
from whombat.models.base import Base
from whombat.models.tag import Tag

__all__ = [
    "AnnotationProject",
    "AnnotationProjectTag",
]


class AnnotationProject(Base):
    """Annotation Project model.

    Attributes
    ----------
    id
        The database id of the annotation project.
    uuid
        The UUID of the annotation project.
    name
        The name of the annotation project.
    description
        The description of the annotation project.
    annotation_instructions
        The instructions for annotators.
    tags
        A list of tags associated with the annotation project.
        Annotations created for this project can only use these tags.
    annotation_tasks
        The list of annotation tasks associated with the annotation project.
    created_on
        The date and time the annotation project was created.

    Parameters
    ----------
    name : str
        The name of the annotation project.
    description : str
        The description of the annotation project.
    annotation_instructions : str, optional
        The instructions for annotators.
    uuid : UUID, optional
        The UUID of the annotation project.
    """

    __tablename__ = "annotation_project"

    id: orm.Mapped[int] = orm.mapped_column(primary_key=True, init=False)
    uuid: orm.Mapped[UUID] = orm.mapped_column(
        default_factory=uuid4,
        kw_only=True,
        unique=True,
    )
    name: orm.Mapped[str] = orm.mapped_column(unique=True)
    description: orm.Mapped[str]
    annotation_instructions: orm.Mapped[str | None] = orm.mapped_column(
        default=None
    )

    # Relationships
    tags: orm.Mapped[list[Tag]] = orm.relationship(
        "Tag",
        secondary="annotation_project_tag",
        lazy="joined",
        viewonly=True,
        default_factory=list,
        repr=False,
    )
    annotation_tasks: orm.Mapped[list["AnnotationTask"]] = orm.relationship(
        back_populates="annotation_project",
        default_factory=list,
        cascade="all, delete-orphan",
    )

    # Secondary relationships
    annotation_project_tags: orm.Mapped[list["AnnotationProjectTag"]] = (
        orm.relationship(
            "AnnotationProjectTag",
            default_factory=list,
            cascade="all, delete-orphan",
        )
    )


class AnnotationProjectTag(Base):
    """Annotation Project Tag model.

    Attributes
    ----------
    annotation_project
        The annotation project associated with the tag.
    tag
        The tag associated with the annotation project.

    Parameters
    ----------
    annotation_project_id : int
        The database id of the annotation project.
    tag_id : int
        The database id of the tag.
    """

    __tablename__ = "annotation_project_tag"
    __table_args__ = (
        UniqueConstraint(
            "annotation_project_id",
            "tag_id",
        ),
    )

    annotation_project_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("annotation_project.id"),
        nullable=False,
        primary_key=True,
    )
    tag_id: orm.Mapped[int] = orm.mapped_column(
        ForeignKey("tag.id"),
        nullable=False,
        primary_key=True,
    )

    # Relationships
    annotation_project: orm.Mapped[AnnotationProject] = orm.relationship(
        "AnnotationProject",
        back_populates="annotation_project_tags",
        init=False,
    )
    tag: orm.Mapped[Tag] = orm.relationship(
        "Tag",
        back_populates="annotation_project_tags",
        lazy="joined",
        init=False,
    )
