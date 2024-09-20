"""Filters for ClipAnnotation Notes."""

from sqlalchemy import Select

from whombat import models
from whombat.filters import base

__all__ = [
    "CreatedOnFilter",
    "UserFilter",
    "IssuesFilter",
    "ClipAnnotationFilter",
    "ClipAnnotationNoteFilter",
]


class CreatedOnFilter(base.DateFilter):
    def filter(self, query: Select) -> Select:
        if self.is_null():
            return query

        query = query.join(
            models.Note,
            models.Note.id == models.ClipAnnotationNote.note_id,
        )

        if self.before is not None:
            query = query.filter(models.Note.created_on < self.before)

        if self.after is not None:
            query = query.filter(models.Note.created_on > self.after)

        if self.on is not None:
            query = query.filter(models.Note.created_on == self.on)

        return query


class UserFilter(base.UUIDFilter):
    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return (
            query.join(
                models.Note,
                models.Note.id == models.ClipAnnotationNote.note_id,
            )
            .join(models.User, models.Note.created_by == models.User.id)
            .filter(models.User.id == self.eq)
        )


class IssuesFilter(base.BooleanFilter):
    def filter(self, query: Select) -> Select:
        if self.eq is None:
            return query

        return query.join(
            models.Note, models.Note.id == models.ClipAnnotationNote.note_id
        ).filter(models.Note.is_issue == self.eq)


class AnnotationProjectFilter(base.UUIDFilter):
    def filter(self, query: Select) -> Select:
        if not self.eq:
            return query

        return (
            query.join(
                models.ClipAnnotation,
                models.ClipAnnotation.id
                == models.ClipAnnotationNote.clip_annotation_id,
            )
            .join(
                models.AnnotationTask,
                models.ClipAnnotation.id
                == models.AnnotationTask.clip_annotation_id,
            )
            .join(
                models.AnnotationProject,
                models.AnnotationTask.annotation_project_id
                == models.AnnotationProject.id,
            )
            .filter(models.AnnotationProject.uuid == self.eq)
        )


class ClipAnnotationFilter(base.UUIDFilter):
    def filter(self, query: Select) -> Select:
        if not self.eq:
            return query

        return query.join(
            models.ClipAnnotation,
            models.ClipAnnotation.id
            == models.ClipAnnotationNote.clip_annotation_id,
        ).where(models.ClipAnnotation.uuid == self.eq)


ClipAnnotationNoteFilter = base.combine(
    created_by=UserFilter,
    created_on=CreatedOnFilter,
    clip_annotation=ClipAnnotationFilter,
    annotation_project=AnnotationProjectFilter,
    issues=IssuesFilter,
)
