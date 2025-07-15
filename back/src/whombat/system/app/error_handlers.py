import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from whombat import exceptions
from whombat.system.settings import Settings

__all__ = ["add_error_handlers"]


async def not_found_error_handler(_, exc: exceptions.NotFoundError):
    """Handle not found errors.

    Parameters
    ----------
    _ : Request
        The request that caused the exception (unused).
    exc : exceptions.NotFoundError
        The exception that was raised.

    Returns
    -------
    JSONResponse
        A JSON response with a 404 status code and an error message.
    """
    return JSONResponse(
        status_code=404,
        content={"message": str(exc)},
    )


async def duplicate_object_error_handler(
    _, exc: exceptions.DuplicateObjectError
):
    """Handle duplicate object errors.

    Parameters
    ----------
    _ : Request
        The request that caused the exception (unused).
    exc : exceptions.DuplicateObjectError
        The exception that was raised.

    Returns
    -------
    JSONResponse
        A JSON response with a 409 status code and an error message.
    """
    return JSONResponse(
        status_code=409,
        content={"message": str(exc)},
    )


async def data_integrity_error_handler(
    _,
    exc: exceptions.DataIntegrityError,
):
    """Handle data integrity errors.

    Parameters
    ----------
    _ : Request
        The request that caused the exception (unused).
    exc : exceptions.DataIntegrityError
        The exception that was raised.

    Returns
    -------
    JSONResponse
        A JSON response with a 409 status code and an error message.
    """
    return JSONResponse(
        status_code=409,
        content={"message": str(exc)},
    )


def add_error_handlers(app: FastAPI, settings: Settings):
    """Add error handlers to the FastAPI application.

    Parameters
    ----------
    app : FastAPI
        The FastAPI application instance.
    settings : Settings
        The application settings.
    """
    app.exception_handler(exceptions.NotFoundError)(not_found_error_handler)
    app.exception_handler(exceptions.DuplicateObjectError)(
        duplicate_object_error_handler
    )
    app.exception_handler(exceptions.DataIntegrityError)(
        data_integrity_error_handler
    )
