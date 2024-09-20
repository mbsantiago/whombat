import { AxiosInstance } from "axios";

import { Page, GetMany } from "@/lib/api/common";
import * as schemas from "@/lib/schemas";
import * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/tags/",
  getRecordingTags: "/api/v1/tags/recording_tags/",
  getClipAnnotationTags: "/api/v1/tags/clip_annotation_tags/",
  getSoundEventAnnotationTags: "/api/v1/tags/sound_event_annotation_tags/",
  create: "/api/v1/tags/",
};

export function registerTagAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getTags(
    query: types.GetMany<types.TagFilter>,
  ): Promise<types.Paginated<types.Tag>> {
    const params = GetMany(schemas.TagFilterSchema).parse(query);
    const response = await instance.get(endpoints.get, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        search: params.search,
        key__eq: params.key,
        value__eq: params.value?.eq,
        value__has: params.value?.has,
        annotation_project__eq: params.annotation_project?.uuid,
        recording__eq: params.recording?.uuid,
        sound_event_annotation__eq: params.sound_event_annotation?.uuid,
        clip_annotation__eq: params.clip_annotation?.uuid,
        sound_event_prediction__eq: params.sound_event_prediction?.uuid,
        clip_prediction__eq: params.clip_prediction?.uuid,
        evaluation_set__eq: params.evaluation_set?.uuid,
        dataset__eq: params.dataset?.uuid,
      },
    });
    return Page(schemas.TagSchema).parse(response.data);
  }

  async function getRecordingTags(
    query: types.GetMany<types.RecordingTagFilter>,
  ): Promise<types.Paginated<types.RecordingTag>> {
    const params = GetMany(schemas.RecordingTagFilterSchema).parse(query);
    const response = await instance.get(endpoints.getRecordingTags, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        recording__eq: params.recording?.uuid,
        dataset__eq: params.dataset?.uuid,
        tag__key: params.tag?.key,
        tag__value: params.tag?.value,
        issue__eq: params.issue,
      },
    });
    return Page(schemas.RecordingTagSchema).parse(response.data);
  }

  async function getClipAnnotationTags(
    query: types.GetManyQuery & types.ClipAnnotationTagFilter,
  ): Promise<types.Paginated<types.ClipAnnotationTag>> {
    const params = GetMany(schemas.ClipAnnotationTagFilterSchema).parse(query);
    const response = await instance.get(endpoints.getClipAnnotationTags, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        annotation_project__eq: params.annotation_project?.uuid,
        evaluation_set__eq: params.evaluation_set?.uuid,
      },
    });
    return Page(schemas.ClipAnnotationTagSchema).parse(response.data);
  }

  async function getSoundEventTags(
    query: types.GetManyQuery & types.SoundEventAnnotationTagFilter,
  ): Promise<types.Paginated<types.SoundEventAnnotationTag>> {
    const params = GetMany(schemas.SoundEventAnnotationTagFilterSchema).parse(
      query,
    );
    const response = await instance.get(endpoints.getSoundEventAnnotationTags, {
      params: {
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sort_by,
        annotation_project__eq: params.annotation_project?.uuid,
        evaluation_set__eq: params.evaluation_set?.uuid,
      },
    });
    return Page(schemas.SoundEventAnnotationTagSchema).parse(response.data);
  }

  async function createTag(data: types.Tag): Promise<types.Tag> {
    const response = await instance.post(endpoints.create, data);
    return schemas.TagSchema.parse(response.data);
  }

  return {
    get: getTags,
    create: createTag,
    getRecordingTags,
    getClipAnnotationTags,
    getSoundEventTags,
  } as const;
}
