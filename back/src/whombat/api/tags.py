"""API functions to interact with tags."""

from typing import Any, Sequence

from soundevent import data
from sqlalchemy import and_, desc, func, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.sql._typing import _ColumnExpressionArgument

from whombat import exceptions, models, schemas
from whombat.api import common
from whombat.filters.base import Filter

__all__ = [
    "TagAPI",
    "tags",
]


class TagAPI(
    common.BaseAPI[
        tuple[str, str],
        models.Tag,
        schemas.Tag,
        schemas.TagCreate,
        schemas.TagUpdate,
    ]
):
    _model = models.Tag
    _schema = schemas.Tag

    async def create(
        self,
        session: AsyncSession,
        key: str,
        value: str,
        **kwargs,
    ) -> schemas.Tag:
        """Create a tag.

        Parameters
        ----------
        session
            The database session.
        key
            The tag key.
        value
            The tag value.

        Returns
        -------
        schemas.Tag
            The tag.
        """
        return await self.create_from_data(
            session,
            schemas.TagCreate(
                key=key,
                value=value,
            ),
            **kwargs,
        )

    async def get_or_create(
        self,
        session: AsyncSession,
        key: str,
        value: str,
    ) -> schemas.Tag:
        """Get a tag by its key and value, or create it if it does not exist.

        Parameters
        ----------
        session
            The database session.
        key
            The tag key.
        value
            The tag value.

        Returns
        -------
        schemas.Tag
            The tag.
        """
        try:
            return await self.get(session, (key, value))
        except exceptions.NotFoundError:
            obj = await self.create(session, key, value)
            self._update_cache(obj)
            return obj

    async def from_soundevent(
        self,
        session: AsyncSession,
        tag: data.Tag,
    ) -> schemas.Tag:
        """Create a tag from a soundevent Tag object.

        Parameters
        ----------
        session
            The database session.
        tag
            The soundevent tag object.

        Returns
        -------
        schemas.TagCreate
            The tag.
        """
        return await self.get_or_create(
            session=session,
            key=tag.key,
            value=tag.value,
        )

    def to_soundevent(
        self,
        tag: schemas.Tag,
    ) -> data.Tag:
        """Create a soundevent Tag object from a tag.

        Parameters
        ----------
        tag
            The tag.

        Returns
        -------
        data.Tag
            The soundevent tag object.
        """
        return data.Tag(
            key=tag.key,
            value=tag.value,
        )

    def _get_pk_from_obj(self, obj: schemas.Tag) -> tuple[str, str]:
        return obj.key, obj.value

    def _get_pk_condition(self, pk: tuple[str, str]):
        return and_(self._model.key == pk[0], self._model.value == pk[1])

    def _key_fn(self, obj: dict):
        return (obj.get("key"), obj.get("value"))

    def _get_key_column(self):
        return tuple_(
            self._model.key,
            self._model.value,
        )

    async def get_recording_tags(
        self,
        session: AsyncSession,
        *,
        limit: int | None = 1000,
        offset: int | None = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = "-created_on",
    ) -> tuple[list[schemas.RecordingTag], int]:
        objs, count = await common.get_objects(
            session,
            models.RecordingTag,
            limit=limit,
            offset=offset,
            filters=filters,
            sort_by=sort_by,
            options=[
                joinedload(models.RecordingTag.recording).load_only(
                    models.Recording.uuid
                )
            ],
        )
        return [
            schemas.RecordingTag(
                created_on=obj.created_on,
                tag=schemas.Tag.model_validate(obj.tag),
                recording_uuid=obj.recording_uuid,
            )
            for obj in objs
        ], count

    async def get_clip_annotation_tags(
        self,
        session: AsyncSession,
        *,
        limit: int | None = 1000,
        offset: int | None = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = "-created_on",
    ) -> tuple[Sequence[schemas.ClipAnnotationTag], int]:
        objs, count = await common.get_objects(
            session,
            models.ClipAnnotationTag,
            limit=limit,
            offset=offset,
            filters=filters,
            sort_by=sort_by,
            options=[
                joinedload(
                    models.ClipAnnotationTag.clip_annotation,
                ).load_only(models.ClipAnnotation.uuid),
            ],
        )
        return [
            schemas.ClipAnnotationTag(
                clip_annotation_uuid=obj.clip_annotation.uuid,
                tag=schemas.Tag.model_validate(obj.tag),
                created_by=schemas.SimpleUser.model_validate(obj.created_by)
                if obj.created_by
                else None,
            )
            for obj in objs
        ], count

    async def get_sound_event_annotation_tags(
        self,
        session: AsyncSession,
        *,
        limit: int | None = 1000,
        offset: int | None = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: str | None = "-created_on",
    ) -> tuple[Sequence[schemas.SoundEventAnnotationTag], int]:
        objs, count = await common.get_objects(
            session,
            models.SoundEventAnnotationTag,
            limit=limit,
            offset=offset,
            filters=filters,
            sort_by=sort_by,
            options=[
                joinedload(
                    models.SoundEventAnnotationTag.sound_event_annotation
                ).load_only(models.SoundEventAnnotation.uuid),
            ],
        )
        return [
            schemas.SoundEventAnnotationTag(
                sound_event_annotation_uuid=obj.sound_event_annotation.uuid,
                tag=schemas.Tag.model_validate(obj.tag),
                created_on=obj.created_on,
                created_by=schemas.SimpleUser.model_validate(obj.created_by)
                if obj.created_by
                else None,
            )
            for obj in objs
        ], count

    async def count_by_sound_event_annotation(
        self,
        session: AsyncSession,
        *,
        limit: int | None = 1000,
        offset: int | None = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: _ColumnExpressionArgument | str | None = "-counts",
    ) -> tuple[Sequence[schemas.TagCount], int]:
        count_column = func.count(
            models.SoundEventAnnotationTag.sound_event_annotation_id
        ).label("counts")

        query = select(models.Tag, count_column).join(
            models.SoundEventAnnotationTag,
            models.Tag.id == models.SoundEventAnnotationTag.tag_id,
        )

        if isinstance(sort_by, str):
            if sort_by == "-counts":
                sort_by = desc(count_column)
            elif sort_by == "counts":
                sort_by = count_column

        results, total = await common.get_objects_from_query(
            session,
            model=models.Tag,
            query=query,
            limit=limit,
            offset=offset,
            filters=filters,
            sort_by=sort_by,
            group_by=models.Tag.id,
        )

        return [
            schemas.TagCount(
                tag=schemas.Tag.model_validate(result[0]),
                count=result[1],
            )
            for result in results
        ], total

    async def count_by_clip_annotation(
        self,
        session: AsyncSession,
        *,
        limit: int | None = 1000,
        offset: int | None = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: _ColumnExpressionArgument | str | None = "-counts",
    ) -> tuple[Sequence[schemas.TagCount], int]:
        count_column = func.count(
            models.ClipAnnotationTag.clip_annotation_id
        ).label("counts")

        query = select(models.Tag, count_column).join(
            models.ClipAnnotationTag,
            models.Tag.id == models.ClipAnnotationTag.tag_id,
        )

        if isinstance(sort_by, str):
            if sort_by == "-counts":
                sort_by = desc(count_column)
            elif sort_by == "counts":
                sort_by = count_column

        results, total = await common.get_objects_from_query(
            session,
            model=models.Tag,
            query=query,
            limit=limit,
            offset=offset,
            filters=filters,
            sort_by=sort_by,
            group_by=models.Tag.id,
        )

        return [
            schemas.TagCount(
                tag=schemas.Tag.model_validate(result[0]),
                count=result[1],
            )
            for result in results
        ], total

    async def count_by_recording(
        self,
        session: AsyncSession,
        *,
        limit: int | None = 1000,
        offset: int | None = 0,
        filters: Sequence[Filter] | None = None,
        sort_by: _ColumnExpressionArgument | str | None = "-counts",
    ) -> tuple[Sequence[schemas.TagCount], int]:
        count_column = func.count(models.RecordingTag.recording_id).label(
            "counts"
        )

        query = select(models.Tag, count_column).join(
            models.RecordingTag,
            models.Tag.id == models.RecordingTag.tag_id,
        )

        if isinstance(sort_by, str):
            if sort_by == "-counts":
                sort_by = desc(count_column)
            elif sort_by == "counts":
                sort_by = count_column

        results, total = await common.get_objects_from_query(
            session,
            model=models.Tag,
            query=query,
            limit=limit,
            offset=offset,
            filters=filters,
            sort_by=sort_by,
            group_by=models.Tag.id,
        )

        return [
            schemas.TagCount(
                tag=schemas.Tag.model_validate(result[0]),
                count=result[1],
            )
            for result in results
        ], total


def find_tag(
    tags: Sequence[schemas.Tag],
    key: str,
    default: Any = None,
) -> schemas.Tag | None:
    """Find a tag from a list of tags by its key.

    Helper function for finding a tag by key. Returns the first tag
    with the given key, or a default value if no tag is found.

    Parameters
    ----------
    tags
        The tags to search.
    key
        The key to search for.
    default
        The default value to return if the tag is not found.

    Returns
    -------
    tag : schemas.Tag | None
        The tag, or the default value if the tag was not found.
    """
    return next((t for t in tags if t.key == key), default)


def find_tag_value(
    tags: Sequence[schemas.Tag],
    key: str,
    default: Any = None,
) -> str | None:
    """Find a the value of a tag from a list of tags by its key.

    Parameters
    ----------
    tags
        The tags to search.
    key
        The key to search for.
    default
        The default value to return if the tag is not found.

    Returns
    -------
    value : float | None
        The tag value, or the default value if the tag was not found.
    """
    tag = find_tag(tags, key)
    if tag is None:
        return default
    return tag.value


tags = TagAPI()
