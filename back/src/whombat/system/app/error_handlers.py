from fastapi import FastAPI
from fastapi.responses import JSONResponse

from whombat import exceptions

__all__ = [
    "add_error_handlers",
]


async def not_found_error_handler(_, exc: exceptions.NotFoundError):
    return JSONResponse(
        status_code=404,
        content={"message": str(exc)},
    )


async def duplicate_object_error_handler(
    _, exc: exceptions.DuplicateObjectError
):
    return JSONResponse(
        status_code=409,
        content={"message": str(exc)},
    )


async def data_integrity_error_handler(
    _,
    exc: exceptions.DataIntegrityError,
):
    return JSONResponse(
        status_code=409,
        content={"message": str(exc)},
    )


def add_error_handlers(app: FastAPI):
    app.exception_handler(exceptions.NotFoundError)(not_found_error_handler)
    app.exception_handler(exceptions.DuplicateObjectError)(
        duplicate_object_error_handler
    )
    app.exception_handler(exceptions.DataIntegrityError)(
        data_integrity_error_handler
    )
