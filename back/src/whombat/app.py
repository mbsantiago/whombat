"""Main module of the API.

It contains the FastAPI instance and the root endpoint.
"""
import warnings

# Ignore warnings from pydantic
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

from whombat.system import create_app, get_settings  # noqa: E402

app = create_app(get_settings())
