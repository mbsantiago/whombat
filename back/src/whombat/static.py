"""Manager for static files."""
from fastapi.staticfiles import StaticFiles
from starlette.responses import Response
from starlette.types import Scope


class WhombatStaticFiles(StaticFiles):
    """Manager for static files.

    This class is used to serve static files from the `statics` directory.
    It is an extension of the `StaticFiles` class from FastAPI that adds
    a compatibility layer with the exports of Next.js.
    """

    def adjust_path(self, path: str) -> str:
        """Adjust the path to serve the correct file."""
        if path.startswith("_next"):
            return path

        if path != "/" and path.endswith("/"):
            return path[:-1] + ".html"

        if path != "/" and not path.endswith(".html"):
            return path + ".html"

        return path

    async def get_response(self, path: str, scope: Scope) -> Response:
        """Get the response for the given path."""
        path = self.adjust_path(path)
        return await super().get_response(path, scope)
