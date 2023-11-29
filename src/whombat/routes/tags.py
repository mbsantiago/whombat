"""REST API routes for tags."""
from fastapi import APIRouter, Depends

from whombat import api, schemas
from whombat.dependencies import Session
from whombat.filters.tags import TagFilter
from whombat.routes.types import Limit, Offset

tags_router = APIRouter()


@tags_router.get("/", response_model=schemas.Page[schemas.Tag])
async def get_tags(
    session: Session,
    limit: Limit = 100,
    offset: Offset = 0,
    sort_by: str | None = "value",
    filter: TagFilter = Depends(TagFilter),  # type: ignore
):
    """Get all tags."""
    tags, total = await api.tags.get_many(
        session,
        limit=limit,
        offset=offset,
        filters=[filter],
        sort_by=sort_by,
    )
    return schemas.Page(
        items=tags,
        total=total,
        limit=limit,
        offset=offset,
    )


@tags_router.post("/", response_model=schemas.Tag)
async def create_tag(tag: schemas.TagCreate, session: Session):
    """Create a new tag."""
    tag = await api.tags.create(session, tag)
    await session.commit()
    return tag
