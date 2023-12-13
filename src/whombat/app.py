"""Main module of the API.

It contains the FastAPI instance and the root endpoint.
"""
import functools
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from whombat.database.init import init_database
from whombat.dependencies import get_settings
from whombat.plugins import add_plugin_pages, add_plugin_routes, load_plugins
from whombat.routes import main_router
from whombat.settings import Settings


@asynccontextmanager
async def lifespan(settings: Settings, _: FastAPI):
    """Context manager to run startup and shutdown events."""
    await init_database(settings)

    yield


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(lifespan=functools.partial(lifespan, settings))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add default routes.
    app.include_router(main_router)

    # Load plugins.
    for name, plugin in load_plugins():
        add_plugin_routes(app, name, plugin)
        add_plugin_pages(app, name, plugin)

    # NOTE: It is important that the static files are mounted after the
    # plugin routes, otherwise the plugin routes will not be found.
    app.mount(
        "/",
        StaticFiles(packages=["whombat"], html=True),
        name="static",
    )

    return app


app = create_app(get_settings())
