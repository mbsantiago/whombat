"""Filters for Notes."""

from whombat import models
from whombat.filters import base

__all__ = [
    "MessageFilter",
    "CreatedByFilter",
    "CreatedAtFilter",
    "IssueFilter",
    "UUIDFilter",
]


MessageFilter = base.string_filter(models.Note.message)
"""Filter note by message content."""

CreatedByFilter = base.uuid_filter(models.Note.created_by_id)
"""Filter notes by the user who created them."""

CreatedAtFilter = base.date_filter(models.Note.created_at)

IssueFilter = base.boolean_filter(models.Note.is_issue)
"""Filter notes by whether they are issues or not."""

UUIDFilter = base.uuid_filter(models.Note.uuid)
"""Filter notes by their UUID."""
