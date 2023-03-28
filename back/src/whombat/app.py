"""Main module of the API.

It contains the FastAPI instance and the root endpoint.

"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()


@app.get("/api/hello/")
def hello_world():
    """Return the item_id and the query string."""
    return "Hello World"


app.mount(
    "/",
    StaticFiles(packages=["whombat"], html=True),
    name="static",
)
