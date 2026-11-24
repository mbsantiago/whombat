"""Custom exceptions for Whombat."""

__all__ = [
    "NotFoundError",
    "DuplicateObjectError",
    "MissingDatabaseError",
    "DataIntegrityError",
    "DataFormatError",
    "SettingsError",
]


class SettingsError(RuntimeError):
    """Raised when a Whombat settings file cannot be loaded."""


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


class DataFormatError(RuntimeError):
    """Raised if the data is not in the expected format."""

    format: str
    """The expected format."""

    def __init__(
        self,
        message: str,
        format: str,
        name: str | None = None,
        details: str | None = None,
    ):
        super().__init__(message)
        self.format = format
        self.name = name
        self.details = details
