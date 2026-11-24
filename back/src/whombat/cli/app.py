"""Top-level Whombat command-line application."""

import uvicorn
from cyclopts import App

from whombat.cli.common import Common
from whombat.cli.users import app as users_app
from whombat.system import get_logging_config

app = App(
    name="whombat",
    help=(
        "Run and manage the Whombat web app.\n\n"
        "Run `whombat` on its own to start the web app. Keep this terminal "
        "open while you use Whombat in your browser."
    ),
)
app.command(users_app)


@app.default
def run(*, common: Common | None = None) -> None:
    """Start the Whombat web app using the selected settings."""
    settings = (common or Common()).settings
    uvicorn.run(
        "whombat.app:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=settings.dev,
        log_config=get_logging_config(settings),
    )
