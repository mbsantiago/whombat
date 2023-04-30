"""Main module of the API.

It contains the FastAPI instance and the root endpoint.

"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from whombat.database.init import init_database
from whombat.routers.auth import auth_router, users_router
from whombat.settings import get_settings

app = FastAPI()

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    users_router,
    prefix="/users",
    tags=["users"],
)

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
