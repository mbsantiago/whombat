"""Custom exceptions for Whombat."""


__all__ = ["NotFoundError"]


class NotFoundError(RuntimeError):
    """Raised when a resource is not found."""
