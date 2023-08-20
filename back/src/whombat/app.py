"""Main module of the API.

It contains the FastAPI instance and the root endpoint.

"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from whombat.dependencies import get_settings
from whombat.database.init import init_database
from whombat.routers import main_router

app = FastAPI()
app.include_router(main_router)
app.mount(
    "/app",
    StaticFiles(packages=["whombat"], html=True),
    name="static",
)


@app.on_event("startup")
async def on_startup():
    """Create the database and tables on startup."""
    settings = get_settings()
    await init_database(settings)
