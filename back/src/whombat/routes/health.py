"""Health check route."""

from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Return the service health status."""
    return {"status": "ok"}
