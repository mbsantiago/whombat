from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from whombat.system.settings import Settings

__all__ = ["add_middlewares"]


def add_middlewares(app: FastAPI, settings: Settings):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
