from contextlib import asynccontextmanager

from fastapi import FastAPI

from whombat.system.boot import whombat_init
from whombat.system.settings import Settings

__all__ = ["lifespan"]


@asynccontextmanager
async def lifespan(settings: Settings, _: FastAPI):
    """Context manager to run startup and shutdown events."""
    await whombat_init(settings)

    yield
