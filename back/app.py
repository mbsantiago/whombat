"""Whombat entry point.

This script starts the Whombat application. It is used in conjunction with the
pyinstaller package to create a standalone executable.
"""

import multiprocessing

import uvicorn

from whombat.system import create_app, get_logging_config, get_settings

settings = get_settings()
config = get_logging_config(settings)
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
        host=settings.host,
        log_level=settings.log_level,
        log_config=config,
        port=settings.port,
        reload=settings.dev,
    )
