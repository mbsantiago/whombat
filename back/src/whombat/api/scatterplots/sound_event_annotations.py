from collections import defaultdict
from typing import Sequence
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models, schemas
from whombat.api.common.utils import get_count
from whombat.filters.base import Filter


class ScatterPlotData(BaseModel):
    """Data for a scatter plot."""

    uuid: UUID
    tags: list[schemas.TagCreate]
    features: list[schemas.Feature]
    recording_tags: list[schemas.TagCreate]


async def get_scatterplot_data(
    session: AsyncSession,
    limit: int = 1000,
    offset: int = 0,
    filters: Sequence[Filter] | None = None,
) -> tuple[list[ScatterPlotData], int]:
    query = select(
        models.SoundEventAnnotation.id,
        models.SoundEventAnnotation.uuid,
    )
    for filter in filters or []:
        query = filter.filter(query)
    count = await get_count(session, models.SoundEventAnnotation, query)
    query = query.limit(limit).offset(offset)

    results = await session.execute(query)
    mapping = {id: uuid for id, uuid in results.all()}

    # get tags
    query = (
        select(
            models.Tag.key, models.Tag.value, models.SoundEventAnnotation.id
        )
        .join(
            models.SoundEventAnnotationTag,
            models.SoundEventAnnotationTag.tag_id == models.Tag.id,
        )
        .join(
            models.SoundEventAnnotation,
            models.SoundEventAnnotation.id
            == models.SoundEventAnnotationTag.sound_event_annotation_id,
        )
        .filter(models.SoundEventAnnotation.id.in_(set(mapping.keys())))
    )
    results = await session.execute(query)
    tags = defaultdict(list)
    for key, value, ann_id in results.all():
        tags[ann_id].append(schemas.TagCreate(key=key, value=value))

    # get recording tags
    query = (
        select(
            models.Tag.key, models.Tag.value, models.SoundEventAnnotation.id
        )
        .join(
            models.RecordingTag,
            models.RecordingTag.tag_id == models.Tag.id,
        )
        .join(
            models.Recording,
            models.Recording.id == models.RecordingTag.recording_id,
        )
        .join(
            models.SoundEvent,
            models.SoundEvent.recording_id == models.Recording.id,
        )
        .join(
            models.SoundEventAnnotation,
            models.SoundEventAnnotation.sound_event_id == models.SoundEvent.id,
        )
        .filter(models.SoundEventAnnotation.id.in_(set(mapping.keys())))
    )
    results = await session.execute(query)
    recording_tags = defaultdict(list)
    for key, value, ann_id in results.all():
        recording_tags[ann_id].append(schemas.TagCreate(key=key, value=value))

    # get features
    query = (
        select(
            models.SoundEventFeature.value,
            models.FeatureName.name,
            models.SoundEventAnnotation.id,
        )
        .join(
            models.FeatureName,
            models.SoundEventFeature.feature_name_id == models.FeatureName.id,
        )
        .join(
            models.SoundEvent,
            models.SoundEventFeature.sound_event_id == models.SoundEvent.id,
        )
        .join(
            models.SoundEventAnnotation,
            models.SoundEventAnnotation.sound_event_id == models.SoundEvent.id,
        )
        .filter(models.SoundEventAnnotation.id.in_(set(mapping.keys())))
    )
    results = await session.execute(query)
    features = defaultdict(list)
    for value, name, ann_id in results.all():
        features[ann_id].append(schemas.Feature(name=name, value=value))

    return [
        ScatterPlotData(
            uuid=mapping[ann_id],
            tags=tags[ann_id],
            features=features[ann_id],
            recording_tags=recording_tags[ann_id],
        )
        for ann_id in mapping.keys()
    ], count
