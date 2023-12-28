import { AxiosInstance } from "axios";
import { z } from "zod";

import { GetManySchema, Page } from "./common";
import { type Tag, TagSchema } from "./schemas";

export const TagPageSchema = Page(TagSchema);

export type TagPage = z.infer<typeof TagPageSchema>;

export const TagCreateSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export type TagCreate = z.input<typeof TagCreateSchema>;

export const RecordingTagSchema = z.object({
  tag: TagSchema,
  recording_uuid: z.string().uuid(),
});

export type RecordingTag = z.infer<typeof RecordingTagSchema>;

export const RecordingTagPageSchema = Page(RecordingTagSchema);

export type RecordingTagPage = z.infer<typeof RecordingTagPageSchema>;

export const TagFilterSchema = z.object({
  search: z.string().optional(),
  key__eq: z.string().optional(),
  value__eq: z.string().optional(),
  value__has: z.string().optional(),
  annotation_project__eq: z.string().uuid().optional(),
  recording__eq: z.string().uuid().optional(),
  sound_event_annotation__eq: z.string().uuid().optional(),
  clip_annotation__eq: z.string().uuid().optional(),
  sound_event_prediction__eq: z.string().uuid().optional(),
  clip_prediction__eq: z.string().uuid().optional(),
  evaluation_set__eq: z.string().uuid().optional(),
  dataset__eq: z.string().uuid().optional(),
});

export type TagFilter = z.input<typeof TagFilterSchema>;

export const RecordingTagFilterSchema = z.object({
  recording__eq: z.string().uuid().optional(),
  dataset__eq: z.string().uuid().optional(),
  tag__key: z.string().uuid().optional(),
  tag__value: z.string().uuid().optional(),
  issue__eq: z.string().uuid().optional(),
});

export type RecordingTagFilter = z.input<typeof RecordingTagFilterSchema>;

export const GetTagsQuerySchema = z.intersection(
  GetManySchema,
  TagFilterSchema,
);

export type GetTagsQuery = z.input<typeof GetTagsQuerySchema>;

export const GetRecordingTagsQuerySchema = z.intersection(
  GetManySchema,
  RecordingTagFilterSchema,
);

export type GetRecordingTagsQuery = z.input<typeof GetRecordingTagsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/tags/",
  getRecordingTags: "/api/v1/tags/recording_tags/",
  create: "/api/v1/tags/",
};

export function registerTagAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getTags(query: GetTagsQuery): Promise<TagPage> {
    const response = await instance.get(endpoints.get, {
      params: GetTagsQuerySchema.parse(query),
    });
    return response.data;
  }

  async function getRecordingTags(
    query: GetRecordingTagsQuery,
  ): Promise<RecordingTagPage> {
    const response = await instance.get(endpoints.getRecordingTags, {
      params: GetRecordingTagsQuerySchema.parse(query),
    });
    return response.data;
  }

  async function createTag(data: TagCreate): Promise<Tag> {
    const response = await instance.post(endpoints.create, data);
    return TagSchema.parse(response.data);
  }

  return { get: getTags, create: createTag, getRecordingTags } as const;
}
