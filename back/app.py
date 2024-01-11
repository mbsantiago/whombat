"""Whombat entry point.

This script starts the Whombat application. It is used in conjunction with the
pyinstaller package to create a standalone executable.
"""

import warnings
import multiprocessing

# Ignore warnings from pydantic
warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    module="pydantic",
)

import uvicorn

from whombat.dependencies import get_settings
from whombat.system import create_app

settings = get_settings()
app = create_app(settings)

if __name__ == "__main__":
    print(
        r"""
    Welcome to:

    __      _| |__   ___  _ __ ___ | |__   __ _| |_
    \ \ /\ / / '_ \ / _ \| '_ ` _ \| '_ \ / _` | __|
     \ V  V /| | | | (_) | | | | | | |_) | (_| | |_
      \_/\_/ |_| |_|\___/|_| |_| |_|_.__/ \__,_|\__|

    An ML-focused audio annotation tool.

    Please wait while Whombat starts up...
    """
    )

    multiprocessing.freeze_support()
    uvicorn.run(
        "app:app",
        host=settings.backend_host,
        log_level="warning",
        reload=False,
        access_log=False,
        port=settings.backend_port,
    )
