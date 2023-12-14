import { z } from "zod";
import { AxiosInstance } from "axios";

import { GetManySchema, Page } from "./common";
import { TagSchema, type Tag } from "./schemas";

export const TagCreateSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export type TagCreate = z.input<typeof TagCreateSchema>;

export const TagPageSchema = Page(TagSchema);

export type TagPage = z.infer<typeof TagPageSchema>;

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
});

export type TagFilter = z.input<typeof TagFilterSchema>;

export const GetTagsQuerySchema = z.intersection(
  GetManySchema,
  TagFilterSchema,
);

export type GetTagsQuery = z.input<typeof GetTagsQuerySchema>;

const DEFAULT_ENDPOINTS = {
  get: "/api/v1/tags/",
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

  async function createTag(data: TagCreate): Promise<Tag> {
    const response = await instance.post(endpoints.create, data);
    return TagSchema.parse(response.data);
  }

  return { get: getTags, create: createTag } as const;
}
