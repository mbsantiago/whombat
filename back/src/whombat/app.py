"""Main module of the API.

It contains the FastAPI instance and the root endpoint.

"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from whombat.database.init import init_database
from whombat.dependencies import get_settings
from whombat.routes import main_router

app = FastAPI()
app.include_router(main_router)
app.mount(
    "/app",
    StaticFiles(packages=["whombat"], html=True),
    name="static",
)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    """Create the database and tables on startup."""
    settings = get_settings()
    await init_database(settings)
