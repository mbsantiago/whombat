import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from whombat.system.settings import Settings

logger = logging.getLogger(__name__)

__all__ = ["add_middlewares"]


async def debug_exception_handling_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        logger.warning("Unhandled error: %s", exc)
        return JSONResponse(
            content={
                "exception": f"{type(exc).__name__}: {exc}",
                "traceback": traceback.format_exc(),
            },
            status_code=500,
        )


def add_middlewares(app: FastAPI, settings: Settings):
    if settings.debug:
        app.middleware("http")(debug_exception_handling_middleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
