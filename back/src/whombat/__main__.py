"""Main entry point for whombat.

This module is used to run the app using uvicorn.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("whombat.app:app", host="0.0.0.0", log_level="info")
