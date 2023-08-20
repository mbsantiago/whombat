"""REST API routes for tags."""


from fastapi import APIRouter

from whombat import api, schemas
from whombat.dependencies import Session

tags_router = APIRouter()


@tags_router.get("/", response_model=list[schemas.Tag])
async def get_tags(session: Session):
    """Get all tags."""
    return await api.tags.get_many(session)


@tags_router.post("/", response_model=schemas.Tag)
async def create_tag(tag: schemas.TagCreate, session: Session):
    """Create a new tag."""
    return await api.tags.create(session, tag)
