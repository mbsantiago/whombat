"""Main module of the API.

It contains the FastAPI instance and the root endpoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from whombat.database.init import init_database
from whombat.dependencies import get_settings
from whombat.plugins import add_plugin_pages, add_plugin_routes, load_plugins
from whombat.routes import main_router

# Initialize the FastAPI instance.
app = FastAPI()

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


# Allow CORS for the frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://0.0.0.0:3000",
        "http://localhost:5000",
        "http://0.0.0.0:5000",
        "https://localhost:5000",
        "https://0.0.0.0:5000",
        "https://localhost:3000",
        "https://0.0.0.0:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize the database on startup.
@app.on_event("startup")
async def on_startup():
    """Create the database and tables on startup."""
    settings = get_settings()
    await init_database(settings)
