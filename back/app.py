"""Whombat entry point.

This script starts the Whombat application. It is used in conjunction with the
pyinstaller package to create a standalone executable.
"""
import uvicorn
import multiprocessing

from whombat.app import create_app
from whombat.dependencies import get_settings

settings = get_settings()
app = create_app(settings)

if __name__ == "__main__":
    multiprocessing.freeze_support()
    uvicorn.run(
        "app:app",
        host="localhost",
        log_level="info",
        reload=False,
        port=5000,
    )
