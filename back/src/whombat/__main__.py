"""Main entry point for whombat.

This module is used to run the app using uvicorn.
"""

from whombat.dependencies import get_settings
import uvicorn

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "whombat.app:app",
        host=settings.backend_host,
        log_level=str(settings.log_level),
        reload=True if settings.debug else False,
        port=settings.backend_port,
    )
