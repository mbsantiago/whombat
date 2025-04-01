"""Custom exceptions for Whombat."""

__all__ = [
    "NotFoundError",
    "DuplicateObjectError",
    "MissingDatabaseError",
]


class NotFoundError(RuntimeError):
    """Raised when a resource is not found."""


class DuplicateObjectError(RuntimeError):
    """Raised when a duplicate object was tried to be created.

    This is used for tags or for other resources are uniquely identified
    by a set of fields.
    """


class MissingDatabaseError(RuntimeError):
    """Raised when the database is not available."""


class DataIntegrityError(RuntimeError):
    """Raised if the operation is canceled due to database constraints.

    These could be caused by cascading deletes clashing with foreign keys
    restrictions.
    """
