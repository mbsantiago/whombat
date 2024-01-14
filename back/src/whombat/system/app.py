"""System module for Whombat.

Functions:
    create_app: Create a FastAPI app.
"""
import functools
from contextlib import asynccontextmanager
from pathlib import Path

from colorama import Fore, Style, just_fix_windows_console
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from whombat import exceptions
from whombat.plugins import add_plugin_pages, add_plugin_routes, load_plugins
from whombat.routes import main_router
from whombat.settings import Settings
from whombat.system.database import init_database

ROOT_DIR = Path(__file__).parent


@asynccontextmanager
async def lifespan(settings: Settings, _: FastAPI):
    """Context manager to run startup and shutdown events."""
    just_fix_windows_console()
    host = settings.backend_host
    port = settings.backend_port
    print("Please wait while the database is initialized...")
    await init_database(settings)
    print(
        f"""
    {Fore.GREEN}{Style.DIM}Whombat is ready to go!{Style.RESET_ALL}

    {Fore.GREEN}{Style.BRIGHT} * Listening on http://{host}:{port}/{Style.RESET_ALL}

    {Fore.YELLOW}Press Ctrl+C to exit.{Style.RESET_ALL}
    """
    )
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

    # Make sure the user guide directory exists.
    # Otherwise app initialization will fail.
    user_guide_dir = ROOT_DIR / "user_guide"
    if not user_guide_dir.exists():
        user_guide_dir.mkdir(parents=True, exist_ok=True)

    statics_dir = ROOT_DIR / "statics"
    if not statics_dir.exists():
        statics_dir.mkdir(parents=True, exist_ok=True)

    app.mount(
        "/guide/",
        StaticFiles(
            packages=[("whombat", "user_guide")],
            html=True,
            check_dir=False,
        ),
        name="guide",
    )

    # NOTE: It is important that the static files are mounted after the
    # plugin routes, otherwise the plugin routes will not be found.
    app.mount(
        "/",
        StaticFiles(packages=["whombat"], html=True),
        name="static",
    )

    @app.exception_handler(exceptions.NotFoundError)
    async def not_found_error_handler(_, exc: exceptions.NotFoundError):
        return JSONResponse(
            status_code=404,
            content={"message": str(exc)},
        )

    @app.exception_handler(exceptions.DuplicateObjectError)
    async def duplicate_object_error_handled(
        _, exc: exceptions.DuplicateObjectError
    ):
        return JSONResponse(
            status_code=409,
            content={"message": str(exc)},
        )

    return app