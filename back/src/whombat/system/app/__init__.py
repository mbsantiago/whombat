import functools

from fastapi import FastAPI

from whombat.system.app.error_handlers import add_error_handlers
from whombat.system.app.lifespan import lifespan
from whombat.system.app.middleware import add_middlewares
from whombat.system.app.routes import ROOT_DIR, add_routes
from whombat.system.settings import Settings

__all__ = ["create_app", "ROOT_DIR"]


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(lifespan=functools.partial(lifespan, settings))
    add_routes(app, settings)
    add_error_handlers(app, settings)
    add_middlewares(app, settings)
    return app
