"""Main entry point for whombat.

This module is used to run the app using uvicorn.
"""

import uvicorn

from whombat.system import get_logging_config, get_settings

if __name__ == "__main__":
    settings = get_settings()
    config = get_logging_config(settings)
    uvicorn.run(
        "whombat.app:app",
        host=settings.backend_host,
        port=settings.backend_port,
        log_level=settings.log_level,
        reload=True if settings.debug else False,
        access_log=True,
        log_config=config,
    )
